# 🚀 Deployment Guide

This guide covers deploying the Bob Triage Engine + Monday.com Integration to various platforms.

## Table of Contents
- [GitHub Pages](#github-pages)
- [Heroku](#heroku)
- [AWS](#aws)
- [Azure](#azure)
- [Docker](#docker)
- [Environment Variables](#environment-variables)

---

## GitHub Pages

### Automatic Deployment (Recommended)

The application automatically deploys to GitHub Pages when you push to the `main` branch.

1. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Save

2. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Access your app:**
   ```
   https://ibm-sevone-npm.github.io/COE-Vector-Bobathon/
   ```

### Manual Deployment

```bash
npm install -g gh-pages
npm run build
gh-pages -d public
```

---

## Heroku

### Prerequisites
- Heroku CLI installed
- Heroku account

### Deployment Steps

1. **Login to Heroku:**
   ```bash
   heroku login
   ```

2. **Create Heroku app:**
   ```bash
   heroku create bob-monday-integration
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set MONDAY_API_TOKEN=your_token_here
   heroku config:set MONDAY_BOARD_ID=your_board_id_here
   heroku config:set NODE_ENV=production
   ```

4. **Add Python buildpack:**
   ```bash
   heroku buildpacks:add heroku/nodejs
   heroku buildpacks:add heroku/python
   ```

5. **Create Procfile:**
   ```bash
   echo "web: node src/server.js" > Procfile
   ```

6. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

7. **Open app:**
   ```bash
   heroku open
   ```

### Heroku Configuration

**Procfile:**
```
web: node src/server.js
```

**app.json:**
```json
{
  "name": "Bob Monday Integration",
  "description": "Intelligent SDLC Assistant",
  "repository": "https://github.com/ibm-sevone-npm/COE-Vector-Bobathon",
  "keywords": ["nodejs", "express", "monday", "triage"],
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    },
    {
      "url": "heroku/python"
    }
  ],
  "env": {
    "MONDAY_API_TOKEN": {
      "description": "Monday.com API token",
      "required": true
    },
    "MONDAY_BOARD_ID": {
      "description": "Monday.com board ID",
      "required": true
    }
  }
}
```

---

## AWS

### AWS Elastic Beanstalk

1. **Install EB CLI:**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB:**
   ```bash
   eb init -p node.js bob-monday-integration
   ```

3. **Create environment:**
   ```bash
   eb create production
   ```

4. **Set environment variables:**
   ```bash
   eb setenv MONDAY_API_TOKEN=your_token MONDAY_BOARD_ID=your_board_id
   ```

5. **Deploy:**
   ```bash
   eb deploy
   ```

6. **Open app:**
   ```bash
   eb open
   ```

### AWS EC2

1. **Launch EC2 instance** (Ubuntu 22.04 LTS)

2. **SSH into instance:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install dependencies:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install Python
   sudo apt install -y python3 python3-pip
   
   # Install Git
   sudo apt install -y git
   ```

4. **Clone and setup:**
   ```bash
   git clone https://github.com/ibm-sevone-npm/COE-Vector-Bobathon.git
   cd bob-monday-integration
   npm install
   pip3 install -r requirements.txt
   ```

5. **Configure environment:**
   ```bash
   nano .env
   # Add your environment variables
   ```

6. **Install PM2:**
   ```bash
   sudo npm install -g pm2
   ```

7. **Start application:**
   ```bash
   pm2 start src/server.js --name bob-monday
   pm2 save
   pm2 startup
   ```

8. **Configure Nginx (optional):**
   ```bash
   sudo apt install -y nginx
   sudo nano /etc/nginx/sites-available/bob-monday
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable:
   ```bash
   sudo ln -s /etc/nginx/sites-available/bob-monday /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## Azure

### Azure App Service

1. **Install Azure CLI:**
   ```bash
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

2. **Login:**
   ```bash
   az login
   ```

3. **Create resource group:**
   ```bash
   az group create --name bob-monday-rg --location eastus
   ```

4. **Create App Service plan:**
   ```bash
   az appservice plan create --name bob-monday-plan --resource-group bob-monday-rg --sku B1 --is-linux
   ```

5. **Create web app:**
   ```bash
   az webapp create --resource-group bob-monday-rg --plan bob-monday-plan --name bob-monday-integration --runtime "NODE|18-lts"
   ```

6. **Configure environment:**
   ```bash
   az webapp config appsettings set --resource-group bob-monday-rg --name bob-monday-integration --settings MONDAY_API_TOKEN=your_token MONDAY_BOARD_ID=your_board_id
   ```

7. **Deploy:**
   ```bash
   az webapp deployment source config-local-git --name bob-monday-integration --resource-group bob-monday-rg
   git remote add azure <deployment-url>
   git push azure main
   ```

---

## Docker

### Dockerfile

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

# Install Python
RUN apk add --no-cache python3 py3-pip

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install dependencies
RUN npm ci --only=production
RUN pip3 install -r requirements.txt

# Copy application files
COPY src/ ./src/
COPY public/ ./public/

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["node", "src/server.js"]
```

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  bob-monday:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONDAY_API_TOKEN=${MONDAY_API_TOKEN}
      - MONDAY_BOARD_ID=${MONDAY_BOARD_ID}
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
```

### Build and Run

```bash
# Build image
docker build -t bob-monday-integration .

# Run container
docker run -d -p 3000:3000 \
  -e MONDAY_API_TOKEN=your_token \
  -e MONDAY_BOARD_ID=your_board_id \
  --name bob-monday \
  bob-monday-integration

# Or use docker-compose
docker-compose up -d
```

### Push to Docker Hub

```bash
docker tag bob-monday-integration your-username/bob-monday-integration:latest
docker push your-username/bob-monday-integration:latest
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONDAY_API_TOKEN` | Monday.com API token | `eyJhbGc...` |
| `MONDAY_BOARD_ID` | Monday.com board ID | `18411696558` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `LOG_LEVEL` | Logging level | `info` |

### Setting Environment Variables

**Local (.env file):**
```env
MONDAY_API_TOKEN=your_token_here
MONDAY_BOARD_ID=your_board_id_here
PORT=3000
NODE_ENV=development
```

**Heroku:**
```bash
heroku config:set MONDAY_API_TOKEN=your_token
```

**AWS:**
```bash
eb setenv MONDAY_API_TOKEN=your_token
```

**Azure:**
```bash
az webapp config appsettings set --settings MONDAY_API_TOKEN=your_token
```

**Docker:**
```bash
docker run -e MONDAY_API_TOKEN=your_token ...
```

---

## SSL/HTTPS Configuration

### Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Monitoring & Logging

### PM2 Monitoring

```bash
pm2 monit
pm2 logs bob-monday
pm2 status
```

### Application Logs

```bash
# View logs
tail -f logs/app.log

# Error logs
tail -f logs/error.log
```

---

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find process
lsof -i :3000
# Kill process
kill -9 <PID>
```

**Python not found:**
```bash
# Check Python
which python3
# Update path in server.js if needed
```

**Monday.com API errors:**
- Verify API token is valid
- Check board ID is correct
- Ensure proper permissions

---

## Scaling

### Horizontal Scaling

**Heroku:**
```bash
heroku ps:scale web=3
```

**AWS:**
- Use Auto Scaling Groups
- Configure Load Balancer

**Azure:**
- Scale out in App Service plan
- Use Azure Load Balancer

### Vertical Scaling

**Heroku:**
```bash
heroku ps:resize web=standard-2x
```

**AWS:**
- Change EC2 instance type

**Azure:**
- Change App Service plan tier

---

## Backup & Recovery

### Database Backup (if applicable)

```bash
# Backup
mongodump --uri="mongodb://..." --out=backup/

# Restore
mongorestore --uri="mongodb://..." backup/
```

### Application Backup

```bash
# Backup code
git clone https://github.com/ibm-sevone-npm/COE-Vector-Bobathon.git backup/

# Backup environment
cp .env .env.backup
```

---

## Support

For deployment issues:
- 📧 Email: devops@example.com
- 💬 Slack: #deployment-support
- 📚 Docs: https://docs.example.com

---

**Made with Bob 🤖** | Last Updated: May 2026