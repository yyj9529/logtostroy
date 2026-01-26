# Contributing to LogToStory

Thank you for your interest in contributing to LogToStory!

## Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/your-feature-name`
5. Make your changes
6. Test your changes locally

## Code Style

This project uses ESLint and Prettier to maintain code quality and consistency.

- Code is automatically formatted on commit via Husky pre-commit hooks
- Run `pnpm lint` to check for linting errors
- Run `pnpm format` to format all files
- TypeScript strict mode is enabled

### Coding Standards

- Use TypeScript for all new code
- Follow the existing code structure and patterns
- Write meaningful commit messages
- Add comments for complex logic
- Keep functions small and focused
- Use semantic variable and function names

## Git Workflow

1. Create a feature branch from `main`
2. Make your changes in small, logical commits
3. Write clear commit messages
4. Push to your fork
5. Open a Pull Request

### Commit Message Format

```
<type>: <subject>

<body>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

Example:
```
feat: add syntax highlighting to code blocks

Implement Shiki for better code syntax highlighting
in the generated posts
```

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add a clear description of your changes
4. Link any related issues
5. Wait for review and address feedback

## Code Review

All submissions require review before merging. We look for:

- Code quality and maintainability
- Test coverage
- Documentation updates
- Adherence to project standards
- No breaking changes (unless discussed)

## Questions?

Feel free to open an issue for any questions or concerns.
