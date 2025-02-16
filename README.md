# GitHub PR Reviewer

An intelligent code review bot that automatically analyzes pull requests and provides detailed feedback on code quality, style, security, and best practices.

## Features

- 🔍 Automated code review for pull requests
- 🎨 Style checking and formatting suggestions
- 🔒 Security vulnerability scanning
- ⚡ Performance analysis
- 📊 Test coverage reporting
- 🔧 Configurable rules and checks

## Setup

1. Install the GitHub App on your repository
2. Configure the review rules in `.github/pr-reviewer-config.yml`
3. Create a pull request and get automated reviews!

## Configuration

Create a `.github/pr-reviewer-config.yml` file in your repository:

```yaml
# Example configuration
reviewers:
  style:
    enabled: true
    rules:
      - eslint
      - prettier
  
  security:
    enabled: true
    severity: high
    
  performance:
    enabled: true
    thresholds:
      complexity: 15
      
  coverage:
    enabled: true
    minimum: 80%
```

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/Tomas-Jankauskas/github-pr-reviewer.git
cd github-pr-reviewer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your GitHub App credentials
```

4. Run tests:
```bash
npm test
```

5. Start development server:
```bash
npm run dev
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.