# doc-genie Project Progress

## ✅ Completed

### Project Setup

### Core Features

## 📝 Todo

- [x] Initialize TypeScript project with proper configuration
- [x] Set up ESLint and Prettier for code quality
- [x] Configure Husky for Git hooks
- [x] Set up proper package.json with all necessary fields
- [x] Configure dotenv for environment variables
- [x] Set up build process with TypeScript
- [x] Implement CLI interface using Commander.js
- [x] Create Git diff scanning functionality
  - [x] Parse Git diffs to find changed files
  - [x] Extract hunks of changes from diffs
  - [x] Configure proper unified diff format (-U1)
- [x] Implement function detection
  - [x] Parse TypeScript/JavaScript files using @typescript-eslint/parser
  - [x] Detect different types of functions (declarations, expressions, arrow functions)
  - [x] Extract function metadata (name, code, location)
  - [x] Check for existing JSDoc comments
- [x] Set up OpenAI integration
- [x] Create test script for development
- [x] fix issue: unable to detect functions with existing jsdocs
- [x] feat: adds AI generate docs as diff that can be accepted/rejected
- [] feat: add full context view functionality for each change - should show the entire file

### Testing

- [ ] Add unit tests for Git diff parsing
- [ ] Add unit tests for function detection
- [ ] Add integration tests for the complete workflow
- [ ] Add test coverage reporting

### Documentation

- [ ] Add detailed API documentation
- [ ] Create user guide with examples
- [ ] Document configuration options
- [ ] Add contributing guidelines
- [ ] Add changelog
- [ ] use doc genie to add jsdocs to all functions

### Features

- [ ] Add support for batch processing multiple files
- [ ] Add configuration file support (.docgenierc or similar)
- [ ] Add customizable JSDoc templates
- [ ] Add support for different documentation styles
- [ ] Add support for class method documentation
- [ ] Add support for interface and type documentation
- [ ] Add dry run mode
- [ ] Add verbose mode for debugging
