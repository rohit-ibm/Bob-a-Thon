# AI Agent Bob + Monday.com Integration Guide

## Overview

This integration connects the **ai-agent-bob** triage system with **Monday.com** to automatically create tasks on your Monday board when Feature Requests or Issue Reports are submitted.

## Architecture

```
User Input (Feature/Issue)
    ↓
ai-agent-bob (server.js)
    ↓
Bob Triage Engine (NLP Analysis)
    ↓
Monday.com Script (add_tasks_to_board.py)
    ↓
Monday.com Board (Task Created)
```

## How It Works

1. **User submits a request** via the ai-agent-bob web interface
2. **Bob analyzes the request** using NLP to understand context, priority, and complexity
3. **Generates tracking ID** (ISS-xxx for issues, FTR-xxx for features)
4. **Automatically creates Monday.com task** with:
   - Task name with tracking ID
   - Appropriate status (Issues: "Stuck", Features: "On Hold")
   - Priority mapping (Critical → Done, High → Working on it, etc.)
   - Full description with type label

## Setup Instructions

### Prerequisites

1. **Node.js** installed (for ai-agent-bob)
2. **Python 3.x** installed (for Monday.com script)
3. **Monday.com API token** (already configured in the script)
4. **Python requests library**: `pip install requests`

### Installation

1. Navigate to the ai-agent-bob directory:
   ```bash
   cd ai-agent-bob
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Verify Python is accessible:
   ```bash
   python --version
   ```

### Running the Application

1. Start the ai-agent-bob server:
   ```bash
   cd ai-agent-bob
   node server.js
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000/index.html
   ```

3. Submit a Feature Request or Report an Issue

4. The system will:
   - Analyze your request
   - Generate insights and recommendations
   - **Automatically create a task on Monday.com**
   - Return the Monday.com task URL in the response

## API Response Format

When you submit a triage request, you'll receive:

```json
{
  "success": true,
  "analysis": {
    "type": "issue",
    "title": "Login button not working",
    "tracking_id": "ISS-ABC123-XYZ",
    "priority": "high",
    "nlp_understanding": "...",
    "insights": [...],
    "recommendations": [...],
    "estimated_effort": "2-4 days",
    "monday_task": {
      "created": true,
      "task_id": "1234567890",
      "task_url": "https://ibm.monday.com/boards/18411696558/pulses/1234567890"
    }
  },
  "timestamp": "2026-05-05T08:00:00.000Z"
}
```

## Priority Mapping

| Bob Priority | Monday.com Status |
|--------------|-------------------|
| Critical     | Done              |
| High         | Working on it     |
| Medium       | On Hold           |
| Low          | Stuck             |

## Type Mapping

| Request Type | Monday.com Initial Status | Label |
|--------------|---------------------------|-------|
| Issue        | Stuck                     | 🐛 BUG REPORT |
| Feature      | On Hold                   | ✨ FEATURE REQUEST |

## Testing the Integration

### Test 1: Feature Request

Submit via the web interface:
- **Type**: Feature Request
- **Title**: Add dark mode support
- **Description**: Users want a dark theme option
- **Priority**: Medium

Expected Result:
- Task created on Monday.com with tracking ID (FTR-xxx)
- Status: "On Hold"
- Priority: "On Hold"

### Test 2: Bug Report

Submit via the web interface:
- **Type**: Report Issue
- **Title**: Login button crashes app
- **Description**: App crashes when clicking login
- **Priority**: Critical

Expected Result:
- Task created on Monday.com with tracking ID (ISS-xxx)
- Status: "Stuck"
- Priority: "Done"

### Test 3: API Testing

You can also test via curl:

```bash
curl -X POST http://localhost:3000/triage \
  -H "Content-Type: application/json" \
  -d '{
    "type": "issue",
    "title": "Database connection timeout",
    "description": "Users experiencing timeout errors when connecting to database",
    "priority": "high",
    "context": "Production environment, affecting 50+ users"
  }'
```

## Standalone Monday.com Script

You can also run the Monday.com script independently:

### Standalone Mode (Sample Tasks)
```bash
cd monday-agent
python add_tasks_to_board.py
```

### Integration Mode (From stdin)
```bash
echo '{"type":"issue","title":"Test Bug","description":"Test description","priority":"high","tracking_id":"ISS-TEST-001"}' | python add_tasks_to_board.py
```

## Troubleshooting

### Issue: "Python not found"
**Solution**: Ensure Python is in your PATH. Try `python3` instead of `python` in server.js if needed.

### Issue: "Monday.com task creation failed"
**Solution**: 
1. Check your API token is valid
2. Verify board ID is correct
3. Check column IDs match your board schema
4. Ensure Python requests library is installed: `pip install requests`

### Issue: "Module not found" errors in Node.js
**Solution**: Run `npm install` in the ai-agent-bob directory

### Issue: Monday.com task created but not visible
**Solution**: 
1. Check the board URL in the response
2. Verify you have access to the board
3. Refresh the Monday.com page

## Configuration

### Changing Monday.com Board

Edit `monday-agent/add_tasks_to_board.py`:

```python
BOARD_ID = "YOUR_BOARD_ID"
BOARD_URL = "https://ibm.monday.com/boards/YOUR_BOARD_ID"
```

### Changing Column IDs

If your board has different columns, update:

```python
STATUS_COLUMN = "your_status_column_id"
PRIORITY_COLUMN = "your_priority_column_id"
```

### Customizing Priority Mapping

Edit the `PRIORITY_MAPPING` dictionary in `add_tasks_to_board.py`:

```python
PRIORITY_MAPPING = {
    "critical": "Your Critical Label",
    "high": "Your High Label",
    "medium": "Your Medium Label",
    "low": "Your Low Label"
}
```

## Features

### Bob Triage Engine Features
- ✅ NLP-based context understanding
- ✅ Automatic priority assessment
- ✅ Complexity analysis
- ✅ Effort estimation
- ✅ Sentiment analysis
- ✅ Keyword extraction
- ✅ Automated recommendations

### Monday.com Integration Features
- ✅ Automatic task creation
- ✅ Tracking ID generation
- ✅ Priority mapping
- ✅ Status assignment
- ✅ Type-based categorization
- ✅ Direct task URL in response

## Workflow Example

1. **Developer reports bug**: "Login button not working on mobile devices"
2. **Bob analyzes**: 
   - Type: Issue
   - Priority: High
   - Complexity: Medium
   - Tracking ID: ISS-L9X2K-A3F7
3. **Monday.com task created**:
   - Name: [ISS-L9X2K-A3F7] Login button not working on mobile devices
   - Status: Stuck (needs attention)
   - Priority: Working on it (high priority)
4. **Team member**:
   - Sees task on Monday board
   - Clicks task to view full details
   - Assigns to developer
   - Updates status as work progresses

## Benefits

1. **Automated Workflow**: No manual task creation needed
2. **Consistent Tracking**: Every request gets a unique tracking ID
3. **Context Preservation**: Full description and analysis stored in Monday.com
4. **Priority Management**: Automatic priority mapping ensures urgent items are visible
5. **Audit Trail**: All requests tracked from submission to completion
6. **Team Visibility**: Everyone sees new tasks immediately on the board

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs in the console
3. Verify Monday.com API token and board access
4. Test the Python script independently

## Made with Bob 🤖