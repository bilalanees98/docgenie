# DocGenie

![DocGenie Logo](https://via.placeholder.com/150x150.png?text=DocGenie)

> AI-powered documentation enforcement tool that automatically generates JSDoc comments for new functions

[![npm version](https://badge.fury.io/js/doc-genie.svg)](https://badge.fury.io/js/doc-genie)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%3E%3D5.0.0-blue.svg)](https://www.typescriptlang.org/)

DocGenie is a CLI tool that helps maintain documentation standards in your codebase by automatically detecting undocumented functions and generating JSDoc comments for them. It integrates with Git to scan diffs and can be used as part of your development workflow or CI/CD pipeline.

## Features

- 🔍 **Detect Undocumented Functions**: Automatically identify functions without JSDoc comments
- 🤖 **AI-Powered Documentation**: Generate meaningful JSDoc comments using OpenAI
- 📊 **Coverage Reporting**: Track documentation coverage across your codebase
- 🔄 **Git Integration**: Scan staged changes or entire repositories
- 🛠️ **Customizable**: Configure thresholds, templates, and more

## Installation

```bash
# Install globally
npm install -g doc-genie

# Or install as a dev dependency in your project
npm install --save-dev doc-genie
```

## Quick Start

1. **Set up your OpenAI API key**:

   ```bash
   # Create a .env file in your project root
   echo "OPENAI_API_KEY=your_api_key_here" > .env
   ```

2. **Scan for undocumented functions in staged changes**:

   ```bash
   doc-genie scan --staged
   ```

3. **Generate a coverage report**:
   ```bash
   doc-genie coverage
   ```

## Usage

### Scanning for Undocumented Functions

```bash
# Scan staged changes
doc-genie scan --staged

# Scan all changes (not just staged)
doc-genie scan

# Scan a specific file
doc-genie scan --file path/to/file.ts
```

### Coverage Reporting

```bash
# Generate a coverage report for the current directory
doc-genie coverage

# Generate a coverage report for a specific file
doc-genie coverage --file path/to/file.ts

# Generate a coverage report for a specific directory
doc-genie coverage --dir path/to/directory

# Set a custom coverage threshold (default: 70%)
doc-genie coverage --threshold 80
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for providing the API that powers the documentation generation
- The TypeScript team for their excellent compiler API
