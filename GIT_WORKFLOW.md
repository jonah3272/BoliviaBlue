# Git Branch Workflow Guide

This guide explains how to use branches for development instead of pushing directly to `main`.

## Why Use Branches?

- **Safety**: Test changes before merging to production
- **Review**: Review changes before they go live
- **Rollback**: Easy to revert if something breaks
- **Collaboration**: Multiple people can work on different features

## Basic Workflow

### 1. Create a New Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or using the newer syntax:
git switch -c feature/your-feature-name
```

**Branch naming conventions:**
- `feature/description` - New features (e.g., `feature/compact-sentiment-header`)
- `fix/description` - Bug fixes (e.g., `fix/mobile-layout`)
- `refactor/description` - Code improvements (e.g., `refactor/api-cleanup`)

### 2. Make Your Changes

Edit files, test locally, then commit:

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "Reduce horizontal space in sentiment header"
```

### 3. Push Your Branch

```bash
# Push branch to GitHub (first time)
git push -u origin feature/your-feature-name

# Subsequent pushes (after first time)
git push
```

### 4. Create a Pull Request (PR)

1. Go to your GitHub repository: https://github.com/jonah3272/BoliviaBlue
2. You'll see a banner suggesting to create a PR for your new branch
3. Click "Compare & pull request"
4. Add a description of your changes
5. Click "Create pull request"

### 5. Review and Merge

- Review your changes in the PR
- Test on the preview (if available)
- Click "Merge pull request" when ready
- Delete the branch after merging (GitHub will offer this)

### 6. Update Your Local Main

After merging, update your local `main` branch:

```bash
# Switch back to main
git checkout main

# Pull latest changes
git pull origin main

# Delete local branch (optional)
git branch -d feature/your-feature-name
```

## Quick Reference Commands

```bash
# See current branch
git branch

# See all branches (local and remote)
git branch -a

# Switch to existing branch
git checkout branch-name
# or
git switch branch-name

# Create branch from current position
git checkout -b new-branch-name

# Push branch to GitHub
git push -u origin branch-name

# Pull latest from main
git checkout main
git pull origin main
```

## Example Workflow

```bash
# 1. Start from main (make sure it's up to date)
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/compact-header

# 3. Make changes, then commit
git add frontend/src/components/DailySentimentHeader.jsx
git commit -m "Reduce horizontal space in sentiment header"

# 4. Push branch
git push -u origin feature/compact-header

# 5. Create PR on GitHub, review, then merge

# 6. After merging, update local main
git checkout main
git pull origin main
```

## Tips

- **Small PRs**: Keep changes focused and small - easier to review
- **Descriptive commits**: Write clear commit messages
- **Regular pushes**: Push often to backup your work
- **Stay updated**: Regularly pull from `main` to keep your branch current

