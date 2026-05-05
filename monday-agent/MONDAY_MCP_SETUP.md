# Monday.com MCP Server Setup Guide

This guide will help you connect to Monday.com and create boards using the Monday MCP (Model Context Protocol) server.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Getting Your Monday.com API Key](#getting-your-mondaycom-api-key)
3. [Installing the MCP Server](#installing-the-mcp-server)
4. [Configuration](#configuration)
5. [Using the Monday MCP Server](#using-the-monday-mcp-server)
6. [Examples](#examples)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js (v16 or higher)
- npm or npx
- A Monday.com account
- Claude Desktop or another MCP-compatible client

## Getting Your Monday.com API Key

1. **Log in to Monday.com**
   - Go to https://monday.com and sign in to your account

2. **Navigate to Admin Settings**
   - Click on your profile picture in the top right
   - Select "Admin" from the dropdown menu

3. **Access API Section**
   - In the Admin panel, go to "API" section
   - You'll find this under "Developers" or "Integrations"

4. **Generate API Token**
   - Click "Generate" or "Create New Token"
   - Give your token a descriptive name (e.g., "MCP Server Access")
   - Select the appropriate scopes/permissions:
     - `boards:read` - Read board data
     - `boards:write` - Create and modify boards
     - `items:read` - Read items
     - `items:write` - Create and modify items
   - Copy the generated API key immediately (you won't be able to see it again)

5. **Store Your API Key Securely**
   - Save it in a secure location
   - Never commit it to version control
   - Use environment variables or secure configuration files

## Installing the MCP Server

The Monday MCP server is available as an npm package and can be run using npx:

```bash
npx -y @modelcontextprotocol/server-monday
```

No installation is required when using npx with the `-y` flag.

## Configuration

### For Claude Desktop

1. **Locate Your Claude Desktop Config File**

   **Windows:**
   ```
   %APPDATA%\Claude\claude_desktop_config.json
   ```

   **macOS:**
   ```
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

   **Linux:**
   ```
   ~/.config/Claude/claude_desktop_config.json
   ```

2. **Add Monday MCP Server Configuration**

   Open the config file and add the Monday server configuration:

   ```json
   {
     "mcpServers": {
       "monday": {
         "command": "npx",
         "args": [
           "-y",
           "@modelcontextprotocol/server-monday"
         ],
         "env": {
           "MONDAY_API_KEY": "your_actual_api_key_here"
         }
       }
     }
   }
   ```

   **Important:** Replace `your_actual_api_key_here` with your actual Monday.com API key.

3. **Restart Claude Desktop**
   - Close Claude Desktop completely
   - Reopen it to load the new configuration

### Alternative: Using Environment Variables

Instead of putting the API key directly in the config file, you can use environment variables:

1. **Set the environment variable:**

   **Windows (PowerShell):**
   ```powershell
   $env:MONDAY_API_KEY = "your_api_key_here"
   ```

   **macOS/Linux:**
   ```bash
   export MONDAY_API_KEY="your_api_key_here"
   ```

2. **Update config to reference the variable:**
   ```json
   {
     "mcpServers": {
       "monday": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-monday"],
         "env": {
           "MONDAY_API_KEY": "${MONDAY_API_KEY}"
         }
       }
     }
   }
   ```

## Using the Monday MCP Server

Once configured, you can interact with Monday.com using natural language through Claude Desktop or your MCP client.

### Available Operations

The Monday MCP server supports:

1. **Creating Boards**
   - Create new boards with custom columns
   - Set board descriptions and properties

2. **Managing Items**
   - Add new items to boards
   - Update existing items
   - Delete items

3. **Querying Data**
   - List all boards
   - Get board details
   - Query items with filters
   - Search across boards

4. **Column Management**
   - Add columns to boards
   - Update column properties
   - Manage column types (status, date, people, etc.)

## Examples

### Example 1: Creating a New Board

Simply ask Claude:

```
Create a new Monday board called "Q2 Marketing Campaign" with the following columns:
- Task Name (text)
- Status (status column with options: Not Started, In Progress, Completed)
- Assigned To (people)
- Due Date (date)
- Priority (status column with options: Low, Medium, High, Critical)
```

### Example 2: Adding Items to a Board

```
Add the following tasks to the "Q2 Marketing Campaign" board:

1. Create social media content calendar
   - Status: In Progress
   - Assigned To: Sarah Johnson
   - Due Date: May 15, 2026
   - Priority: High

2. Design email templates
   - Status: Not Started
   - Assigned To: Mike Chen
   - Due Date: May 20, 2026
   - Priority: Medium
```

### Example 3: Querying Board Data

```
Show me all high-priority tasks in the "Q2 Marketing Campaign" board that are due this week
```

### Example 4: Updating Items

```
Update the "Create social media content calendar" task:
- Change status to "Completed"
- Add a note: "Calendar created and shared with team"
```

### Example 5: Creating a Project Management Board

```
Create a comprehensive project management board called "Website Redesign" with these columns:
- Task (text)
- Status (Not Started, Planning, In Progress, Review, Done)
- Owner (people)
- Start Date (date)
- Due Date (date)
- Priority (Low, Medium, High, Critical)
- Budget (numbers)
- Dependencies (text)
```

## Troubleshooting

### Issue: MCP Server Not Connecting

**Solution:**
1. Verify your API key is correct
2. Check that the API key has the necessary permissions
3. Ensure Node.js is installed and accessible
4. Restart Claude Desktop after configuration changes

### Issue: "Invalid API Key" Error

**Solution:**
1. Regenerate your API key in Monday.com
2. Update the configuration with the new key
3. Ensure there are no extra spaces or quotes around the key

### Issue: Permission Denied Errors

**Solution:**
1. Check your API token permissions in Monday.com
2. Ensure the token has `boards:write` and `items:write` scopes
3. Verify you have the necessary permissions in your Monday.com workspace

### Issue: Board Not Found

**Solution:**
1. Verify the board name is spelled correctly
2. Check that you have access to the board in Monday.com
3. Try listing all boards first to see available boards

### Issue: MCP Server Crashes

**Solution:**
1. Check Node.js version (should be v16+)
2. Clear npm cache: `npm cache clean --force`
3. Try running the server manually to see error messages:
   ```bash
   MONDAY_API_KEY=your_key npx @modelcontextprotocol/server-monday
   ```

## Best Practices

1. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables for sensitive data
   - Rotate API keys periodically

2. **Board Organization**
   - Use clear, descriptive board names
   - Establish consistent column naming conventions
   - Document your board structure

3. **Error Handling**
   - Always verify operations completed successfully
   - Keep backups of important board data
   - Test changes on non-critical boards first

4. **Performance**
   - Batch operations when possible
   - Avoid excessive API calls
   - Use specific queries instead of fetching all data

## Additional Resources

- [Monday.com API Documentation](https://developer.monday.com/api-reference/docs)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Monday.com Developer Community](https://community.monday.com/c/developers)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Monday.com API status page
3. Consult the MCP server documentation
4. Contact Monday.com support for API-related issues

---

**Last Updated:** May 2026