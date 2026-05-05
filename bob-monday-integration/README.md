# 🤖 Bob Triage Engine + Monday.com Integration

[![CI/CD Pipeline](https://github.com/ibm-sevone-npm/COE-Vector-Bobathon/actions/workflows/deploy.yml/badge.svg)](https://github.com/ibm-sevone-npm/COE-Vector-Bobathon/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/python-3.11-blue)](https://www.python.org/)

> Intelligent SDLC Assistant with NLP-powered triage and automated Monday.com task creation

## 🌟 Features

### Core Capabilities
- ✅ **NLP-Powered Analysis** - Understands context, sentiment, and complexity
- ✅ **Automated Triage** - Intelligent priority and effort estimation
- ✅ **Monday.com Integration** - Automatic task creation with proper categorization
- ✅ **Tracking IDs** - Unique identifiers for every request (ISS-xxx, FTR-xxx)
- ✅ **Smart Recommendations** - Context-aware suggestions for handling
- ✅ **Effort Estimation** - AI-driven development time predictions
- ✅ **Sentiment Analysis** - Detects urgency and emotional context
- ✅ **Keyword Extraction** - Identifies key topics and themes

### Integration Features
- 🔗 **RESTful API** - Easy integration with existing tools
- 📊 **Real-time Processing** - Instant analysis and task creation
- 🎯 **Priority Mapping** - Automatic Monday.com status assignment
- 📝 **Rich Metadata** - Comprehensive task information
- 🔄 **Graceful Fallback** - Works even if Monday.com is unavailable

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 14.0.0
- **Python** >= 3.11
- **npm** >= 6.0.0
- **Monday.com API Token**

### Installation

```bash
# Clone the repository
git clone https://github.com/ibm-sevone-npm/COE-Vector-Bobathon.git
cd bob-monday-integration

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install requests

# Start the server
npm start
```

### Access the Application

- **Web Interface**: http://localhost:3000
- **API Endpoint**: http://localhost:3000/api/triage
- **Health Check**: http://localhost:3000/api/health

## 📖 Usage

### Web Interface

1. Open http://localhost:3000 in your browser
2. Choose **Report Issue** or **Request Feature**
3. Fill in the details:
   - Title
   - Description
   - Priority (Critical, High, Medium, Low)
   - Additional Context (optional)
4. Click **Submit**
5. View the analysis and Monday.com task link

### API Usage

#### Submit a Bug Report

```bash
curl -X POST http://localhost:3000/api/triage \
  -H "Content-Type: application/json" \
  -d '{
    "type": "issue",
    "title": "Login button not responding",
    "description": "Users report that the login button is unresponsive on mobile devices",
    "priority": "critical",
    "context": "Affecting 100+ users in production"
  }'
```

#### Submit a Feature Request

```bash
curl -X POST http://localhost:3000/api/triage \
  -H "Content-Type: application/json" \
  -d '{
    "type": "feature",
    "title": "Add dark mode support",
    "description": "Users want a dark theme option for better viewing at night",
    "priority": "medium"
  }'
```

#### Response Format

```json
{
  "success": true,
  "analysis": {
    "type": "issue",
    "title": "Login button not responding",
    "tracking_id": "ISS-MOSF0KXD-0B80",
    "priority": "critical",
    "complexity": "low",
    "estimated_effort": "1-2 days (Low complexity) - Fast-track recommended",
    "nlp_understanding": "This appears to be a critical priority bug report...",
    "insights": [
      "Mobile platform specific issue detected",
      "High priority issue - should be addressed in current sprint"
    ],
    "recommendations": [
      "Assign to senior developer immediately",
      "Schedule emergency deployment if needed",
      "Create test cases to prevent regression"
    ],
    "sentiment": "negative",
    "keywords": ["login", "button", "responding", "users", "report"],
    "monday_task": {
      "created": true,
      "task_id": "11924787349",
      "task_url": "https://ibm.monday.com/boards/18411696558/pulses/11924787349"
    }
  },
  "timestamp": "2026-05-05T09:17:49.031Z"
}
```

## 🏗️ Architecture

```
┌─────────────────┐
│   User Input    │
│ (Web/API/CLI)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Bob Triage     │
│  Engine (NLP)   │
│  • Analysis     │
│  • Insights     │
│  • Recommendations
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Monday.com     │
│  Integration    │
│  • Task Creation│
│  • Status Map   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Monday.com     │
│  Board          │
│  (Task Created) │
└─────────────────┘
```

## 📁 Project Structure

```
bob-monday-integration/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── src/
│   ├── server.js               # Main Express server
│   ├── services/
│   │   └── monday-integration.py  # Monday.com API integration
│   └── utils/                  # Utility functions
├── public/
│   └── index.html              # Web interface
├── tests/
│   └── integration-test.js     # Integration tests
├── scripts/
│   └── setup.sh                # Setup scripts
├── .gitignore
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Monday.com Configuration
MONDAY_API_TOKEN=your_api_token_here
MONDAY_BOARD_ID=your_board_id_here

# Optional
LOG_LEVEL=info
```

### Monday.com Setup

1. Get your API token from Monday.com:
   - Go to your Monday.com account
   - Navigate to Admin → API
   - Generate a new API token

2. Find your Board ID:
   - Open your Monday.com board
   - The ID is in the URL: `https://ibm.monday.com/boards/[BOARD_ID]`

3. Update the configuration in `src/services/monday-integration.py`

## 🎯 Priority Mapping

| Bob Priority | Monday.com Status | Use Case |
|--------------|-------------------|----------|
| Critical     | Done              | Production issues, security vulnerabilities |
| High         | Working on it     | Important features, major bugs |
| Medium       | On Hold           | Standard requests, moderate issues |
| Low          | Stuck             | Nice-to-have features, minor bugs |

## 🔄 Type Mapping

| Request Type | Monday.com Status | Label | Description |
|--------------|-------------------|-------|-------------|
| Issue        | Stuck             | 🐛 BUG REPORT | Bugs requiring attention |
| Feature      | On Hold           | ✨ FEATURE REQUEST | New features in backlog |

## 🧪 Testing

### Run Integration Tests

```bash
npm test
```

### Manual Testing

```bash
# Test Monday.com integration standalone
cd src/services
echo '{"type":"issue","title":"Test Bug","description":"Test","priority":"high","tracking_id":"TEST-001"}' | python monday-integration.py
```

## 🚢 Deployment

### GitHub Actions (Automatic)

The application automatically deploys when you push to the `main` branch:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### Manual Deployment

```bash
# Build and deploy
npm run build
npm run deploy
```

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create bob-monday-integration

# Set environment variables
heroku config:set MONDAY_API_TOKEN=your_token
heroku config:set MONDAY_BOARD_ID=your_board_id

# Deploy
git push heroku main
```

### Deploy to AWS/Azure/GCP

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed cloud deployment instructions.

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "ok",
  "service": "Bob Triage Engine + Monday.com Integration",
  "version": "2.0.0",
  "features": [
    "NLP Parsing",
    "Issue Understanding",
    "Automated Triage",
    "Monday.com Integration"
  ],
  "timestamp": "2026-05-05T09:17:49.031Z"
}
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 API Documentation

### Endpoints

#### POST /api/triage
Submit a new issue or feature request for triage.

**Request Body:**
```json
{
  "type": "issue" | "feature",
  "title": "string",
  "description": "string",
  "priority": "critical" | "high" | "medium" | "low",
  "context": "string (optional)"
}
```

**Response:** See [Response Format](#response-format) above

#### GET /api/health
Check service health status.

**Response:**
```json
{
  "status": "ok",
  "service": "string",
  "version": "string",
  "features": ["array"],
  "timestamp": "ISO 8601 string"
}
```

## 🐛 Troubleshooting

### Common Issues

**Issue: "Python not found"**
```bash
# Solution: Ensure Python is in PATH
python --version
# or try
python3 --version
```

**Issue: "Monday.com task creation failed"**
```bash
# Solution: Check API token and board ID
# Verify in src/services/monday-integration.py
```

**Issue: "Port 3000 already in use"**
```bash
# Solution: Change port in .env or kill existing process
PORT=3001 npm start
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**IBM SDN-COE-IND**
- Workspace: SDN-COE-IND
- Board: SOE Boathon
- Repository: [COE-Vector-Bobathon](https://github.com/ibm-sevone-npm/COE-Vector-Bobathon)

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Powered by [Monday.com API](https://developer.monday.com/)
- NLP capabilities inspired by modern AI assistants
- Made with ❤️ by Bob

## 📞 Support

For issues, questions, or contributions:
- 📧 Email: support@example.com
- 💬 Slack: #bob-triage-engine
- 🐛 Issues: [GitHub Issues](https://github.com/ibm-sevone-npm/COE-Vector-Bobathon/issues)

---

**Made with Bob 🤖** | Version 2.0.0 | Last Updated: May 2026