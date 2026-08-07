# Contributing to Wiki Race

Thank you for your interest in contributing to Wiki Race! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/OS information

### Suggesting Features

1. Check if the feature has already been suggested
2. Create an issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Potential implementation approach
   - Mockups or examples if applicable

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages: `git commit -m "Add: feature description"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

## Development Setup

See [SETUP.md](SETUP.md) for complete setup instructions.

Quick start:
```bash
npm install
cd backend && npm run db:push
npm run dev
```

## Code Style

- Use TypeScript for all code
- Follow existing code formatting (ESLint/Prettier)
- Write meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Testing

Before submitting a PR:
- [ ] Test locally with multiple players
- [ ] Verify no TypeScript errors: `npm run build`
- [ ] Check for console errors
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Verify responsive design works

## Commit Message Guidelines

Use conventional commits:
- `feat: add new feature`
- `fix: fix bug in component`
- `docs: update README`
- `style: format code`
- `refactor: restructure service`
- `test: add tests`
- `chore: update dependencies`

## Project Structure

- `backend/` - Express server and WebSocket logic
- `frontend/` - Next.js application
- `shared/` - Shared TypeScript types
- See [QUICKSTART.md](QUICKSTART.md) for detailed structure

## Key Areas for Contribution

### Easy
- UI/UX improvements
- Additional Wikipedia article pairs
- Documentation improvements
- Bug fixes

### Medium
- New game modes
- Performance optimizations
- Better error handling
- Analytics integration

### Advanced
- Lobby chat feature
- Match replay system
- Leaderboards
- Admin dashboard

## Questions?

Feel free to:
- Open an issue for discussion
- Ask in pull request comments
- Check existing documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Wiki Race! 🎉
