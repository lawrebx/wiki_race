import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface WikipediaArticleProps {
  articleTitle: string;
  deadPages: string[];
  occupiedPages: { [page: string]: string };
  onLinkClick: (targetPage: string) => void;
  disabled: boolean;
  path: string[];
}

export default function WikipediaArticle({
  articleTitle,
  deadPages,
  occupiedPages,
  onLinkClick,
  disabled,
  path,
}: WikipediaArticleProps) {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (articleTitle) {
      loadArticle(articleTitle);
    }
  }, [articleTitle]);

  const loadArticle = async (title: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiClient.getArticle(title);
      setArticle(response.article);
    } catch (err: any) {
      setError(err.message || 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    const target = e.target as HTMLElement;
    if (target.tagName === 'A' && target.hasAttribute('data-article')) {
      e.preventDefault();
      const articleTitle = target.getAttribute('data-article');
      if (articleTitle) {
        onLinkClick(articleTitle);
      }
    }
  };

  const enhanceContent = (content: string): string => {
    if (!content) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // Find all Wikipedia links
    const links = doc.querySelectorAll('a[rel="mw:WikiLink"]');
    
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('./')) return;

      const articleTitle = href.substring(2);
      
      // Set data attribute for click handling
      link.setAttribute('data-article', articleTitle);

      // Check if dead or occupied
      if (deadPages.includes(articleTitle)) {
        link.classList.add('dead-link');
        link.setAttribute('title', '☠️ This page is DEAD');
      } else if (occupiedPages[articleTitle]) {
        link.classList.add('occupied-link');
        link.setAttribute('title', '⚠️ This page is currently occupied');
      } else {
        link.classList.add('valid-link');
      }

      // Remove href to prevent navigation
      link.removeAttribute('href');
    });

    return doc.body.innerHTML;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="card max-w-md">
          <h3 className="text-xl font-bold text-red-600 mb-2">Error</h3>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="bg-white">
      {/* Article Header */}
      <div className="border-b bg-gray-50 px-8 py-4">
        <h1 className="text-3xl font-bold">{article.title.replace(/_/g, ' ')}</h1>
      </div>

      {/* Path breadcrumb */}
      <div className="border-b bg-blue-50 px-8 py-2">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="text-gray-600 font-medium">Your path:</span>
          {path.map((page, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className={idx === path.length - 1 ? 'font-bold text-primary-600' : 'text-gray-700'}>
                {page.replace(/_/g, ' ')}
              </span>
              {idx < path.length - 1 && <span className="text-gray-400">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Article Content */}
      <div
        className="wiki-content px-8 py-6 max-w-4xl"
        onClick={handleLinkClick}
        dangerouslySetInnerHTML={{ __html: enhanceContent(article.content) }}
      />

      {/* Legend */}
      <div className="border-t bg-gray-50 px-8 py-4">
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary-100 border border-primary-600 rounded"></div>
            <span>Valid Link</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-occupied-light border border-occupied rounded"></div>
            <span>Occupied (someone is there)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-dead-light border border-dead rounded"></div>
            <span>Dead Page (blocked)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
