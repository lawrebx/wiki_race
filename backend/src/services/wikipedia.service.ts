import axios from 'axios';
import * as cheerio from 'cheerio';
import { db, articleCache } from '../db/index.js';
import { eq } from 'drizzle-orm';

const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/api/rest_v1';
const WIKIPEDIA_WEB_BASE = 'https://en.wikipedia.org/wiki';

export interface WikipediaArticle {
  title: string;
  content: string;
  links: string[];
}

export class WikipediaService {
  
  /**
   * Get an article, checking cache first, then fetching from Wikipedia if needed
   */
  async getArticle(title: string): Promise<WikipediaArticle | null> {
    try {
      // Normalize title
      const normalizedTitle = this.normalizeTitle(title);
      
      // Check cache first
      const cached = await this.getCachedArticle(normalizedTitle);
      if (cached) {
        // Update last accessed time
        await db.update(articleCache)
          .set({ lastAccessedAt: new Date() })
          .where(eq(articleCache.title, normalizedTitle));
        
        return {
          title: cached.title,
          content: cached.content,
          links: cached.links as string[],
        };
      }

      // Fetch from Wikipedia
      const article = await this.fetchFromWikipedia(normalizedTitle);
      if (!article) {
        return null;
      }

      // Cache the article
      await this.cacheArticle(article);

      return article;
    } catch (error) {
      console.error(`Error getting article "${title}":`, error);
      return null;
    }
  }

  /**
   * Get cached article from database
   */
  private async getCachedArticle(title: string) {
    const result = await db.select()
      .from(articleCache)
      .where(eq(articleCache.title, title))
      .limit(1);
    
    return result[0] || null;
  }

  /**
   * Cache an article in the database
   */
  private async cacheArticle(article: WikipediaArticle) {
    await db.insert(articleCache).values({
      title: article.title,
      content: article.content,
      links: article.links,
      cachedAt: new Date(),
      lastAccessedAt: new Date(),
    }).onConflictDoNothing();
  }

  /**
   * Fetch article from Wikipedia API
   */
  private async fetchFromWikipedia(title: string): Promise<WikipediaArticle | null> {
    try {
      // Fetch HTML content from Wikipedia
      const response = await axios.get(
        `${WIKIPEDIA_API_BASE}/page/html/${encodeURIComponent(title)}`,
        {
          headers: {
            'Accept': 'text/html',
            'User-Agent': 'WikiRaceGame/1.0 (Educational Project)',
          },
        }
      );

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract valid internal article links
      const links = this.extractValidLinks($);

      // Clean up the HTML for display
      const cleanedContent = this.cleanHTML($);

      return {
        title,
        content: cleanedContent,
        links,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log(`Article not found: ${title}`);
        return null;
      }
      throw error;
    }
  }

  /**
   * Extract valid internal Wikipedia article links
   */
  private extractValidLinks($: cheerio.CheerioAPI): string[] {
    const links = new Set<string>();

    // Find all article links in the content
    $('a[rel="mw:WikiLink"]').each((_, element) => {
      const href = $(element).attr('href');
      if (!href) return;

      // Extract article title from href (format: ./Article_Title)
      if (href.startsWith('./')) {
        const articleTitle = decodeURIComponent(href.substring(2));
        
        // Filter out invalid links
        if (this.isValidArticleLink(articleTitle)) {
          links.add(articleTitle);
        }
      }
    });

    return Array.from(links);
  }

  /**
   * Check if a link is a valid article link
   */
  private isValidArticleLink(title: string): boolean {
    // Exclude special pages
    const invalidPrefixes = [
      'Wikipedia:',
      'Help:',
      'File:',
      'Category:',
      'Template:',
      'Talk:',
      'Special:',
      'Portal:',
      'User:',
      'MediaWiki:',
    ];

    for (const prefix of invalidPrefixes) {
      if (title.startsWith(prefix)) {
        return false;
      }
    }

    // Exclude pages with fragments (anchors)
    if (title.includes('#')) {
      return false;
    }

    return true;
  }

  /**
   * Clean HTML for game display
   */
  private cleanHTML($: cheerio.CheerioAPI): string {
    // Remove unwanted elements
    $('style, script, .mw-editsection, .reference, .noprint').remove();
    
    // Get the main content
    const content = $('body').html() || '';
    
    return content;
  }

  /**
   * Normalize Wikipedia article title
   */
  normalizeTitle(title: string): string {
    // Replace spaces with underscores and capitalize first letter
    return title.trim()
      .replace(/ /g, '_')
      .replace(/^./, (str) => str.toUpperCase());
  }

  /**
   * Get a random article pair based on difficulty
   */
  async getArticlePair(difficulty: 'easy' | 'medium' | 'hard'): Promise<{ start: string; target: string } | null> {
    // For MVP, use predefined pairs
    const pairs = this.getPredefinedPairs(difficulty);
    const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
    return randomPair;
  }

  /**
   * Predefined article pairs for different difficulties
   */
  private getPredefinedPairs(difficulty: string): Array<{ start: string; target: string }> {
    const easy = [
      { start: 'United_States', target: 'Barack_Obama' },
      { start: 'Dog', target: 'Pet' },
      { start: 'Basketball', target: 'Michael_Jordan' },
      { start: 'Pizza', target: 'Italy' },
      { start: 'Computer', target: 'Internet' },
    ];

    const medium = [
      { start: 'Peanut_butter', target: 'Apollo_11' },
      { start: 'Coffee', target: 'World_War_II' },
      { start: 'Guitar', target: 'Mathematics' },
      { start: 'Bicycle', target: 'Ancient_Rome' },
      { start: 'Dolphin', target: 'Space_Shuttle' },
    ];

    const hard = [
      { start: 'Toothpaste', target: 'Quantum_mechanics' },
      { start: 'Saxophone', target: 'Byzantine_Empire' },
      { start: 'Skateboard', target: 'RNA' },
      { start: 'Origami', target: 'Paleontology' },
      { start: 'Popcorn', target: 'Topology' },
    ];

    switch (difficulty) {
      case 'easy':
        return easy;
      case 'medium':
        return medium;
      case 'hard':
        return hard;
      default:
        return medium;
    }
  }

  /**
   * Validate that a target page exists in the source page's links
   */
  async validateMove(fromPage: string, toPage: string): Promise<boolean> {
    const article = await this.getArticle(fromPage);
    if (!article) {
      return false;
    }

    const normalizedTarget = this.normalizeTitle(toPage);
    return article.links.includes(normalizedTarget);
  }
}

export const wikipediaService = new WikipediaService();
