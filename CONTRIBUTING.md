# Contributing to SwasthyaSetu

First off, thank you for considering contributing to SwasthyaSetu! It's people like you that make SwasthyaSetu a great tool for improving healthcare access across India.

## 🌟 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (screenshots, code snippets)
- **Describe the behavior you observed** and what you expected
- **Include your environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any alternative solutions** you've considered

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding style** used throughout the project
3. **Write clear commit messages** (see commit guidelines below)
4. **Include tests** if applicable
5. **Update documentation** as needed
6. **Ensure all tests pass** before submitting

## 🚀 Getting Started

### Development Setup

1. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SwasthyaSetu.git
   cd SwasthyaSetu
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and other credentials
   ```

4. **Seed the database:**
   ```bash
   npm run seed
   ```

5. **Start the backend server:**
   ```bash
   npm start
   ```

6. **Run the frontend:**
   ```bash
   # In project root
   npx http-server -p 3000
   ```

7. **Access the application:**
   Open `http://localhost:3000` in your browser

## 📝 Coding Guidelines

### JavaScript Style

- Use **ES6+ syntax** (const/let, arrow functions, template literals)
- Use **meaningful variable names** (descriptive, not abbreviated)
- Add **comments** for complex logic
- Follow **DRY principle** (Don't Repeat Yourself)
- Keep functions **small and focused** (single responsibility)

### File Organization

- Place services in `js/services/`
- Place page-specific scripts in `js/pages/`
- Place reusable components in `js/components/`
- Place utility functions in `js/utils/`

### CSS Guidelines

- Use **Tailwind CSS classes** where possible
- Custom CSS goes in `css/components/` for component-specific styles
- Follow **mobile-first** approach
- Use **CSS variables** for theme colors

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(aqi): add real-time air quality monitoring

Integrated OpenWeatherMap API to fetch AQI data based on user location.
Added color-coded status indicators and health recommendations.

Closes #123
```

```
fix(auth): resolve government login redirect issue

Government users were being redirected to patient dashboard.
Updated auth service to check role before redirect.

Fixes #456
```

## 🧪 Testing

### Manual Testing Checklist

Before submitting a PR, test the following:

- [ ] Patient login and dashboard access
- [ ] Hospital admin login and features
- [ ] Government login and portal access
- [ ] Appointment booking flow
- [ ] AQI monitoring display
- [ ] Location permission handling
- [ ] Responsive design (mobile, tablet, desktop)

### API Testing

Test backend endpoints using tools like Postman or curl:

```bash
# Health check
curl http://localhost:5000/api/health-check

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"12-3456-7890-1234","password":"patient123"}'
```

## 📁 Project Structure

```
SwasthyaSetu/
├── backend/           # Node.js + Express backend
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API routes
│   └── server.js      # Entry point
├── js/
│   ├── services/      # Service modules (API, Auth, AQI, etc.)
│   ├── pages/         # Page-specific scripts
│   ├── components/    # Reusable UI components
│   └── utils/         # Helper functions
├── pages/             # HTML pages
├── css/               # Stylesheets
└── docs/              # Documentation
```

## 🎯 Areas for Contribution

### High Priority
- [ ] Add unit tests for services
- [ ] Implement offline support with service workers
- [ ] Add more hospital data to database
- [ ] Improve accessibility (WCAG 2.1 compliance)
- [ ] Add multi-language support (Hindi, regional languages)

### Medium Priority
- [ ] Create mobile app (React Native)
- [ ] Add push notifications for health alerts
- [ ] Implement WebSocket for real-time updates
- [ ] Add more health metrics (BMI calculator, etc.)
- [ ] Improve error handling and user feedback

### Good First Issues
- [ ] Fix typos in documentation
- [ ] Add more demo data
- [ ] Improve UI/UX of specific pages
- [ ] Add loading states and animations
- [ ] Write additional API documentation

## 🤝 Code Review Process

1. **Automated checks** run on all PRs (linting, tests)
2. **Maintainer review** within 48 hours
3. **Feedback addressed** by contributor
4. **Approval and merge** by maintainer

## 📞 Getting Help

- **GitHub Issues:** For bug reports and feature requests
- **Discussions:** For questions and general discussion
- **Email:** support@swasthyasetu.gov.in (for sensitive issues)

## 📜 License

By contributing to SwasthyaSetu, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website (when available)

---

**Thank you for contributing to SwasthyaSetu and helping improve healthcare access for millions!** 🚀
