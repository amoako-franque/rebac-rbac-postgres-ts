# Steps to Push to GitHub

## Option 1: New Repository (First Time Setup)

### Step 1: Initialize Git Repository
```bash
cd /Users/amoako/Downloads/RBAC_ReBAC/rebac-rbac-postgres-ts
git init
```

### Step 2: Create .gitignore (if not exists)
Make sure `.gitignore` includes:
```
node_modules/
dist/
.env
.env.local
logs/
*.log
.DS_Store
```

### Step 3: Add All Files
```bash
git add .
```

### Step 4: Create Initial Commit
```bash
git commit -m "Initial commit: RBAC+ReBAC API with improvements"
```

### Step 5: Create Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `rebac-rbac-postgres-ts` (or your preferred name)
3. Description: "Production-ready RBAC+ReBAC API with TypeScript, Prisma, and PostgreSQL"
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have files)
6. Click "Create repository"

### Step 6: Add Remote and Push
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/rebac-rbac-postgres-ts.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/rebac-rbac-postgres-ts.git

# Push to main branch
git branch -M main
git push -u origin main
```

## Option 2: Existing Repository (Update)

### Step 1: Check Current Status
```bash
git status
```

### Step 2: Add Changed Files
```bash
# Add all changes
git add .

# Or add specific files
git add src/
git add .github/
git add package.json
```

### Step 3: Commit Changes
```bash
git commit -m "feat: Add CI/CD improvements, service layer, and enhancements

- Add comprehensive CI/CD pipeline with security scanning
- Implement service layer architecture
- Add request ID middleware and compression
- Add database indexes for performance
- Improve TypeScript configuration
- Add API versioning
- Create constants file"
```

### Step 4: Push to GitHub
```bash
# Push to main branch
git push origin main

# Or if pushing to different branch
git push origin develop
```

## Option 3: Quick Commands (All-in-One)

```bash
# Initialize (if needed)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: RBAC+ReBAC API with improvements"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/rebac-rbac-postgres-ts.git

# Set main branch
git branch -M main

# Push
git push -u origin main
```

## Common Git Commands

### Check Status
```bash
git status
```

### See Changes
```bash
git diff
```

### View Commit History
```bash
git log --oneline
```

### Create New Branch
```bash
git checkout -b feature/new-feature
```

### Switch Branch
```bash
git checkout main
```

### Merge Branch
```bash
git checkout main
git merge feature/new-feature
```

### Pull Latest Changes
```bash
git pull origin main
```

## Troubleshooting

### If you get "remote origin already exists"
```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/rebac-rbac-postgres-ts.git
```

### If you get authentication errors
```bash
# Use Personal Access Token instead of password
# Or set up SSH keys:
ssh-keygen -t ed25519 -C "your_email@example.com"
# Then add to GitHub: Settings → SSH and GPG keys
```

### If you need to undo last commit (keep changes)
```bash
git reset --soft HEAD~1
```

### If you need to undo last commit (discard changes)
```bash
git reset --hard HEAD~1
```

## Pre-Push Checklist

- [ ] All tests pass: `npm test`
- [ ] Code builds successfully: `npm run build`
- [ ] No sensitive data in code (check for API keys, passwords)
- [ ] `.env` file is in `.gitignore`
- [ ] `node_modules` is in `.gitignore`
- [ ] Commit message is descriptive
- [ ] All changes are staged (`git add .`)

## Recommended Branch Strategy

```bash
# Main branch (production-ready code)
main

# Development branch
develop

# Feature branches
feature/add-new-endpoint
feature/improve-error-handling

# Bug fix branches
bugfix/fix-auth-issue
```

## Example Workflow

```bash
# 1. Create feature branch
git checkout -b feature/add-pagination

# 2. Make changes
# ... edit files ...

# 3. Stage changes
git add .

# 4. Commit
git commit -m "feat: Add pagination to records endpoint"

# 5. Push branch
git push origin feature/add-pagination

# 6. Create Pull Request on GitHub
# 7. After review, merge to main
git checkout main
git pull origin main
git merge feature/add-pagination
git push origin main
```

