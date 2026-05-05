#!/bin/bash

# Deploy to GitHub using GitHub CLI
# Usage: ./scripts/deploy-to-github.sh

set -e

echo "=========================================="
echo "Bob Monday Integration - GitHub Deployment"
echo "=========================================="
echo ""

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed!"
    echo "Please install it first:"
    echo "  Windows: winget install --id GitHub.cli"
    echo "  macOS: brew install gh"
    echo "  Linux: See https://cli.github.com/manual/installation"
    exit 1
fi

echo "✅ GitHub CLI found"

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "🔐 Not authenticated with GitHub. Starting authentication..."
    gh auth login
else
    echo "✅ Already authenticated with GitHub"
fi

# Initialize git if not already
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: Bob Monday Integration v2.0"
else
    echo "✅ Git repository already initialized"
fi

# Check if remote exists
if git remote get-url origin &> /dev/null; then
    echo "✅ Remote 'origin' already configured"
    REPO_URL=$(git remote get-url origin)
    echo "   Repository: $REPO_URL"
else
    echo "🔗 Configuring remote repository..."
    
    # Ask user for repository details
    read -p "Enter GitHub organization/username (default: ibm-sevone-npm): " ORG
    ORG=${ORG:-ibm-sevone-npm}
    
    read -p "Enter repository name (default: COE-Vector-Bobathon): " REPO
    REPO=${REPO:-COE-Vector-Bobathon}
    
    # Check if repository exists
    if gh repo view "$ORG/$REPO" &> /dev/null; then
        echo "✅ Repository $ORG/$REPO exists"
        git remote add origin "https://github.com/$ORG/$REPO.git"
    else
        echo "📝 Repository doesn't exist. Creating..."
        read -p "Make repository public? (y/n, default: y): " PUBLIC
        PUBLIC=${PUBLIC:-y}
        
        if [ "$PUBLIC" = "y" ]; then
            gh repo create "$ORG/$REPO" --public --source=. --remote=origin
        else
            gh repo create "$ORG/$REPO" --private --source=. --remote=origin
        fi
    fi
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git branch -M main

if git push -u origin main; then
    echo "✅ Successfully pushed to GitHub!"
else
    echo "⚠️  Push failed. Trying force push..."
    read -p "Force push? This will overwrite remote. (y/n): " FORCE
    if [ "$FORCE" = "y" ]; then
        git push -u origin main --force
        echo "✅ Force push successful!"
    else
        echo "❌ Push cancelled"
        exit 1
    fi
fi

# Open repository in browser
echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "📦 Repository: $(git remote get-url origin)"
echo "🌐 View in browser:"
gh repo view --web

echo ""
echo "Next steps:"
echo "1. Configure GitHub Actions secrets (if needed)"
echo "2. Deploy to Fyre machine (see FYRE_DEPLOYMENT.md)"
echo "3. Monitor CI/CD pipeline in Actions tab"
echo ""

# Made with Bob
