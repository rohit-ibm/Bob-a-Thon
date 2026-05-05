# 🚀 Quick Start Guide

Get Bob Monday Integration up and running in 5 minutes!

## For GitHub Deployment (Using GitHub CLI)

### Step 1: Install GitHub CLI

**Windows:**
```bash
winget install --id GitHub.cli
```

**macOS:**
```bash
brew install gh
```

**Linux:**
```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo apt update && sudo apt install gh
```

### Step 2: Run Deployment Script

**Windows:**
```bash
cd bob-monday-integration
scripts\deploy-to-github.bat
```

**Linux/macOS:**
```bash
cd bob-monday-integration
chmod +x scripts/deploy-to-github.sh
./scripts/deploy-to-github.sh
```

### Step 3: Done! 🎉

Your repository is now on GitHub and ready for Fyre deployment.

---

## For Fyre Machine Deployment

### Prerequisites
- SSH access to Fyre machine
- Fyre machine hostname/IP

### Quick Deploy

1. **SSH to Fyre:**
   ```bash
   ssh your-username@fyre-hostname
   ```

2. **Clone and Setup:**
   ```bash
   # Clone repository
   gh repo clone ibm-sevone-npm/COE-Vector-Bobathon
   cd COE-Vector-Bobathon/bob-monday-integration
   
   # Install dependencies
   npm install --production
   pip3 install -r requirements.txt
   
   # Configure environment
   nano .env
   # Add your MONDAY_API_TOKEN and MONDAY_BOARD_ID
   
   # Install PM2
   sudo npm install -g pm2
   
   # Start application
   pm2 start src/server.js --name bob-monday
   pm2 save
   pm2 startup
   ```

3. **Access Application:**
   ```
   http://your-fyre-hostname:3000
   ```

---

## For Local Development

### Quick Start

```bash
cd bob-monday-integration

# Install dependencies
npm install
pip install -r requirements.txt

# Start server
npm start

# Access at http://localhost:3000
```

---

## Testing

```bash
# Run integration tests
npm test

# Test Monday.com integration
echo '{"type":"issue","title":"Test","description":"Test","priority":"high","tracking_id":"TEST-001"}' | python src/services/monday-integration.py
```

---

## Common Commands

### GitHub CLI
```bash
gh auth login              # Authenticate
gh repo view --web         # Open repo in browser
gh repo sync               # Sync with remote
```

### PM2 (Fyre)
```bash
pm2 status                 # View status
pm2 logs bob-monday        # View logs
pm2 restart bob-monday     # Restart app
pm2 monit                  # Monitor
```

### Git
```bash
git pull                   # Pull updates
git add .                  # Stage changes
git commit -m "message"    # Commit
git push                   # Push to GitHub
```

---

## Need Help?

- 📚 **Full Documentation**: See [README.md](README.md)
- 🔥 **Fyre Deployment**: See [FYRE_DEPLOYMENT.md](FYRE_DEPLOYMENT.md)
- 🚀 **Other Platforms**: See [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Made with Bob 🤖**