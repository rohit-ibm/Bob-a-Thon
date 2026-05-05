# 🔥 Fyre Machine Deployment Guide

Complete guide for deploying Bob Monday Integration to IBM Fyre machine using GitHub CLI.

## Table of Contents
- [Prerequisites](#prerequisites)
- [GitHub CLI Setup](#github-cli-setup)
- [Push to GitHub](#push-to-github)
- [Fyre Machine Deployment](#fyre-machine-deployment)
- [Configuration](#configuration)
- [Monitoring](#monitoring)

---

## Prerequisites

### Local Machine
- ✅ GitHub CLI (`gh`) installed
- ✅ Git installed
- ✅ Node.js >= 14.0.0
- ✅ Python >= 3.11

### Fyre Machine Access
- ✅ SSH access to Fyre machine
- ✅ Fyre machine IP/hostname
- ✅ SSH key configured

---

## GitHub CLI Setup

### 1. Install GitHub CLI (if not installed)

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
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

### 2. Authenticate with GitHub

```bash
gh auth login
```

Follow the prompts:
1. Choose: **GitHub.com**
2. Choose: **HTTPS** (recommended) or **SSH**
3. Choose: **Login with a web browser**
4. Copy the one-time code
5. Press Enter to open browser
6. Paste code and authorize

Verify authentication:
```bash
gh auth status
```

---

## Push to GitHub

### 1. Initialize Git Repository

```bash
cd bob-monday-integration

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Bob Monday Integration v2.0"
```

### 2. Create GitHub Repository

**Option A: Create new repository**
```bash
gh repo create COE-Vector-Bobathon --public --source=. --remote=origin --push
```

**Option B: Connect to existing repository**
```bash
gh repo clone ibm-sevone-npm/COE-Vector-Bobathon
# Copy files to cloned directory
# Then commit and push
```

**Option C: Manual connection**
```bash
git remote add origin https://github.com/ibm-sevone-npm/COE-Vector-Bobathon.git
git branch -M main
git push -u origin main
```

### 3. Verify Repository

```bash
# View repository in browser
gh repo view --web

# Check repository status
gh repo view
```

---

## Fyre Machine Deployment

### 1. Connect to Fyre Machine

```bash
# SSH into Fyre machine
ssh your-username@fyre-machine-hostname

# Or with specific key
ssh -i ~/.ssh/fyre_key your-username@fyre-machine-hostname
```

### 2. Install Dependencies on Fyre

```bash
# Update system
sudo yum update -y  # For RHEL/CentOS
# OR
sudo apt update && sudo apt upgrade -y  # For Ubuntu/Debian

# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs  # RHEL/CentOS
# OR
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs  # Ubuntu/Debian

# Verify Node.js
node --version
npm --version

# Install Python 3.11
sudo yum install -y python3 python3-pip  # RHEL/CentOS
# OR
sudo apt install -y python3 python3-pip  # Ubuntu/Debian

# Verify Python
python3 --version
pip3 --version

# Install Git
sudo yum install -y git  # RHEL/CentOS
# OR
sudo apt install -y git  # Ubuntu/Debian
```

### 3. Clone Repository on Fyre

```bash
# Navigate to deployment directory
cd /opt  # or your preferred location
# OR
cd ~/apps

# Clone repository
git clone https://github.com/ibm-sevone-npm/COE-Vector-Bobathon.git
cd COE-Vector-Bobathon/bob-monday-integration

# Or use gh CLI
gh repo clone ibm-sevone-npm/COE-Vector-Bobathon
cd COE-Vector-Bobathon/bob-monday-integration
```

### 4. Install Application Dependencies

```bash
# Install Node.js dependencies
npm install --production

# Install Python dependencies
pip3 install -r requirements.txt
```

### 5. Configure Environment

```bash
# Create .env file
nano .env
```

Add the following:
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Monday.com Configuration
MONDAY_API_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjY1MzI0MTQ0OSwiYWFpIjoxMSwidWlkIjo1Mzk0MTI5NywiaWFkIjoiMjAyNi0wNS0wNFQwNToyNjozNi4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTM1MzY5ODEsInJnbiI6InVzZTEifQ.csO7Z0vA0xkrE-_tFeicx6f8ds3qk6lVvpH_uBqZjbw
MONDAY_BOARD_ID=18411696558

# Logging
LOG_LEVEL=info
```

Save and exit (Ctrl+X, Y, Enter)

### 6. Test Application

```bash
# Test run
npm start

# In another terminal, test the API
curl http://localhost:3000/api/health
```

If successful, stop with Ctrl+C

### 7. Install PM2 for Process Management

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application with PM2
pm2 start src/server.js --name bob-monday-integration

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it outputs
```

### 8. Configure Firewall

```bash
# Allow port 3000
sudo firewall-cmd --permanent --add-port=3000/tcp  # RHEL/CentOS
sudo firewall-cmd --reload

# OR for Ubuntu/Debian
sudo ufw allow 3000/tcp
sudo ufw reload
```

### 9. Setup Nginx Reverse Proxy (Optional but Recommended)

```bash
# Install Nginx
sudo yum install -y nginx  # RHEL/CentOS
# OR
sudo apt install -y nginx  # Ubuntu/Debian

# Create Nginx configuration
sudo nano /etc/nginx/conf.d/bob-monday.conf
```

Add:
```nginx
server {
    listen 80;
    server_name your-fyre-hostname.fyre.ibm.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Test Nginx configuration
sudo nginx -t

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Allow HTTP through firewall
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

---

## Configuration

### Environment Variables

Edit `.env` file:
```bash
nano .env
```

### PM2 Configuration

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'bob-monday-integration',
    script: 'src/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

Start with config:
```bash
pm2 start ecosystem.config.js
```

---

## Monitoring

### PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs bob-monday-integration

# Monitor in real-time
pm2 monit

# View detailed info
pm2 info bob-monday-integration
```

### Application Logs

```bash
# View application logs
tail -f logs/out.log
tail -f logs/error.log

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Checks

```bash
# Check application health
curl http://localhost:3000/api/health

# Check from external
curl http://your-fyre-hostname.fyre.ibm.com/api/health
```

---

## Updating Application

### Pull Latest Changes

```bash
cd /opt/COE-Vector-Bobathon/bob-monday-integration

# Pull latest code
git pull origin main

# Install any new dependencies
npm install --production
pip3 install -r requirements.txt

# Restart application
pm2 restart bob-monday-integration
```

### Using GitHub CLI

```bash
# Check for updates
gh repo sync

# Pull latest
git pull

# Restart
pm2 restart bob-monday-integration
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000
# OR
sudo netstat -tulpn | grep 3000

# Kill process
sudo kill -9 <PID>
```

### PM2 Issues

```bash
# Stop all processes
pm2 stop all

# Delete all processes
pm2 delete all

# Restart PM2
pm2 restart bob-monday-integration
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R $USER:$USER /opt/COE-Vector-Bobathon

# Fix permissions
chmod -R 755 /opt/COE-Vector-Bobathon
```

### Python Not Found

```bash
# Check Python path
which python3

# Update server.js if needed
# Change spawn('python', ...) to spawn('python3', ...)
```

---

## Security Best Practices

### 1. Secure Environment Variables

```bash
# Restrict .env file permissions
chmod 600 .env
```

### 2. Setup SSL/TLS (Recommended)

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-fyre-hostname.fyre.ibm.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 3. Configure SELinux (RHEL/CentOS)

```bash
# Allow Nginx to connect to network
sudo setsebool -P httpd_can_network_connect 1
```

---

## Quick Reference Commands

### GitHub CLI Commands

```bash
# View repository
gh repo view

# Create issue
gh issue create

# Create PR
gh pr create

# View workflows
gh workflow list

# View workflow runs
gh run list
```

### Deployment Commands

```bash
# SSH to Fyre
ssh user@fyre-hostname

# Navigate to app
cd /opt/COE-Vector-Bobathon/bob-monday-integration

# Pull updates
git pull

# Restart app
pm2 restart bob-monday-integration

# View logs
pm2 logs
```

---

## Access URLs

After deployment, access your application at:

- **Direct**: `http://your-fyre-hostname.fyre.ibm.com:3000`
- **Via Nginx**: `http://your-fyre-hostname.fyre.ibm.com`
- **With SSL**: `https://your-fyre-hostname.fyre.ibm.com`

### API Endpoints

- **Health Check**: `http://your-fyre-hostname.fyre.ibm.com/api/health`
- **Triage**: `http://your-fyre-hostname.fyre.ibm.com/api/triage`
- **Web UI**: `http://your-fyre-hostname.fyre.ibm.com/`

---

## Support

For deployment issues:
- 📧 Email: devops@ibm.com
- 💬 Slack: #fyre-support
- 📚 Fyre Docs: https://fyre.ibm.com/docs

---

**Made with Bob 🤖** | Fyre Deployment Guide | Last Updated: May 2026