# 🚀 DocGenie Roadmap

DocGenie is an AI-powered tool that aims to enforce documenation in codebases. Initially it will automatically detect new functions in a commit diff and generates JSDoc-style comments. Below is the planned development roadmap.

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

---
 
## **🔮 Potential Future Pathways: Expanding DocGenie as a Documentation Enforcer**

### **Documentation Coverage Tracking**
- Generate a **Doc Coverage Report** (like test coverage).  
- Show **% of documented functions vs. undocumented ones**.  
- CI/CD integration: **Fail PRs if new functions aren’t documented**.  

### **Enforce Documentation Standards**
- Lint JSDoc comments for **missing parameters, return types, or descriptions**.  
- Allow **custom JSDoc templates** per project.  
- Work with **ESLint & Prettier** for doc formatting enforcement.  

### **GitHub & GitLab Bot for PR Documentation Checks**
- Auto-comment on PRs when **new functions lack documentation**.  
- Suggest AI-generated JSDoc directly in PR comments.  
- Allow maintainers to enforce **doc compliance before merging**.  

### **AI-Powered Doc Quality Analysis**
- Detect **vague or low-quality** doc comments.  
- Suggest **better explanations** using AI.  
- Flag **outdated documentation** based on function changes.  

### **JSDoc Auto-Refactoring & Maintenance**
- Detect and fix **inconsistent doc formatting**.  
- Auto-update doc comments when function signatures change.  
- Enforce **naming conventions in documentation**.  

### **Team Dashboard for Doc Health**
- Track **documentation trends over time**.  
- Show which devs are contributing good documentation.  
- Identify **undocumented high-impact functions**.  

### **Multi-Language Support**
- Expand beyond JavaScript & TypeScript.  
- Support **Python (docstrings), Go (godoc), Java (Javadoc), etc.**.  
- Ensure **cross-language documentation consistency**.  




