# 🚀 DocGenie Roadmap

DocGenie is an AI-powered tool that automatically detects new functions in a commit diff and generates JSDoc-style comments. Below is the planned development roadmap.

## **📅 Phase 1: MVP (Weeks 1-4)**
### 🎯 Goal: Build a working CLI that detects new functions and generates JSDoc comments.

✅ **Week 1** – Project Setup & Basic CLI  
- [ ] Initialize a **Node.js + TypeScript** CLI project.  
- [ ] Add Git integration: Extract commit diffs (`git diff`).  
- [ ] Parse diff to detect added functions (Regex-based).  
- [ ] Setup **OpenAI API** for JSDoc generation.  

✅ **Week 2** – CLI Improvements & Auto-Insert JSDoc  
- [ ] Improve function detection using **AST parsing** (Acorn/Babel).  
- [ ] Generate JSDoc comments with **AI-powered descriptions**.  
- [ ] Automatically insert JSDoc before functions in the code.  

✅ **Week 3** – Pre-commit Hook & GitHub Action  
- [ ] Create a **Git pre-commit hook** (runs before commits).  
- [ ] Setup an optional **GitHub Action** (auto-comments on PR diffs).  
- [ ] Allow configuration via `.docgenie.config.json`.  

✅ **Week 4** – Open-Source Release  
- [ ] Publish **DocGenie CLI** as an **npm package**.  
- [ ] Add a **README.md** with installation & usage guide.  
- [ ] Setup a **landing page** (GitHub Pages or simple Next.js site).  

---

## **🚀 Phase 2: Enhancements (Weeks 5-8)**
### 🎯 Goal: Improve accuracy, add more integrations, and increase adoption.

✅ **Week 5-6** – Advanced AI & Customization  
- [ ] Improve JSDoc formatting & linting support.  
- [ ] Allow users to define **custom templates** for JSDoc.  
- [ ] Add **multi-file support** (scan entire repo, not just diffs).  

✅ **Week 7-8** – IDE & CI/CD Integration  
- [ ] **VS Code Extension** for real-time suggestions.  
- [ ] **GitHub Bot** that comments on PRs.  
- [ ] Option to store generated docs in a separate file (`docs/`).  
