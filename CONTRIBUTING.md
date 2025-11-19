# Contributing to mSYNQ

Thank you for considering contributing to mSYNQ! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/msynq-app.git
   cd msynq-app
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up Firebase**
   - Create your own Firebase project
   - Copy `.env.example` to `.env`
   - Fill in your Firebase credentials
   - **Never commit your `.env` file!**

5. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic

2. **Test your changes**
   - Run the dev server: `npm run dev`
   - Test all affected features
   - Check browser console for errors

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   **Commit message format:**
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Describe your changes

## Code Style Guidelines

### JavaScript/React
- Use functional components with hooks
- Use arrow functions for components
- Destructure props
- Use meaningful variable names
- Add JSDoc comments for complex functions

**Example:**
```jsx
export const MyComponent = ({ userId, onUpdate }) => {
  const [state, setState] = useState(null);
  
  // Clear, descriptive function names
  const handleUpdate = () => {
    onUpdate(state);
  };
  
  return <div onClick={handleUpdate}>...</div>;
};
```

### CSS/Tailwind
- Use Tailwind utility classes
- Keep custom CSS minimal
- Use responsive classes (sm:, md:, lg:)
- Group related classes together

### File Organization
- One component per file
- Name files same as component (PascalCase)
- Keep components small and focused
- Use custom hooks for shared logic

## What to Contribute

### Good First Issues
- Documentation improvements
- UI/UX enhancements
- Bug fixes
- Adding tests
- Accessibility improvements

### Feature Ideas
- New video sources (Vimeo, Dailymotion)
- Playlist management
- User authentication
- Room passwords
- Reactions/emojis
- Voice chat
- Screen sharing

### Bug Reports
When reporting bugs, include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and OS
- Console errors (if any)
- Screenshots (if applicable)

## Pull Request Guidelines

### Before Submitting
- [ ] Code follows project style
- [ ] All features work as expected
- [ ] No console errors
- [ ] Documentation updated (if needed)
- [ ] Commit messages are clear

### PR Description Should Include
- What changes were made
- Why the changes were needed
- How to test the changes
- Screenshots (for UI changes)
- Related issues (if any)

### Review Process
1. Maintainer reviews your PR
2. Feedback may be provided
3. Make requested changes
4. PR is merged when approved

## Security

**Never commit:**
- `.env` files
- Firebase credentials
- API keys
- Personal information
- Sensitive data

**If you accidentally commit secrets:**
1. Rotate the credentials immediately
2. Remove from Git history
3. Update `.gitignore`

## Questions?

- Open an issue for questions
- Check existing documentation
- Review closed issues/PRs

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to mSYNQ! 🎉**
