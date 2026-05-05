"""
Example script to create a Monday.com board using MCP server
This script demonstrates how to interact with Monday.com through the MCP protocol
"""

import os
import json
from typing import Dict, Any

# Note: This is a conceptual example showing how you would interact with Monday.com
# through the MCP server. The actual implementation depends on your MCP client setup.

def create_board_example():
    """
    Example of creating a Monday.com board
    
    When using the Monday MCP server through Claude Desktop or another MCP client,
    you would use natural language commands like:
    
    "Create a new Monday board called 'Project Alpha' with columns for Status, Owner, and Due Date"
    
    The MCP server will handle the API calls to Monday.com automatically.
    """
    
    # Board configuration
    board_config = {
        "name": "Project Alpha",
        "description": "Main project tracking board",
        "columns": [
            {"title": "Task", "type": "text"},
            {"title": "Status", "type": "status"},
            {"title": "Owner", "type": "people"},
            {"title": "Due Date", "type": "date"},
            {"title": "Priority", "type": "status"}
        ]
    }
    
    print("Board Configuration:")
    print(json.dumps(board_config, indent=2))
    print("\n" + "="*50)
    print("To create this board using Monday MCP server:")
    print("="*50)
    print("\n1. Ensure the MCP server is configured in your Claude Desktop config")
    print("2. Use natural language to request board creation:")
    print(f"\n   'Create a Monday board named \"{board_config['name']}\" with the following columns:'")
    for col in board_config['columns']:
        print(f"   - {col['title']} ({col['type']})")
    
    return board_config


def add_items_example():
    """
    Example of adding items to a Monday.com board
    """
    
    items = [
        {
            "name": "Setup project repository",
            "status": "Working on it",
            "owner": "John Doe",
            "due_date": "2026-05-10",
            "priority": "High"
        },
        {
            "name": "Design database schema",
            "status": "Stuck",
            "owner": "Jane Smith",
            "due_date": "2026-05-12",
            "priority": "High"
        },
        {
            "name": "Create API endpoints",
            "status": "Not started",
            "owner": "Bob Johnson",
            "due_date": "2026-05-15",
            "priority": "Medium"
        }
    ]
    
    print("\n" + "="*50)
    print("Example Items to Add:")
    print("="*50)
    for i, item in enumerate(items, 1):
        print(f"\nItem {i}:")
        print(json.dumps(item, indent=2))
    
    print("\n" + "="*50)
    print("To add items using Monday MCP server:")
    print("="*50)
    print("\nUse commands like:")
    print("'Add a new item to the Project Alpha board:'")
    print(f"  Name: {items[0]['name']}")
    print(f"  Status: {items[0]['status']}")
    print(f"  Owner: {items[0]['owner']}")
    print(f"  Due Date: {items[0]['due_date']}")
    
    return items


def query_board_example():
    """
    Example of querying Monday.com board data
    """
    
    print("\n" + "="*50)
    print("Querying Board Data:")
    print("="*50)
    print("\nExample queries you can make:")
    print("- 'Show me all items in the Project Alpha board'")
    print("- 'List all high priority tasks'")
    print("- 'Show items assigned to John Doe'")
    print("- 'Get all items due this week'")
    print("- 'Show the status of all tasks'")


if __name__ == "__main__":
    print("="*50)
    print("Monday.com MCP Server - Usage Examples")
    print("="*50)
    
    # Create board example
    board_config = create_board_example()
    
    # Add items example
    items = add_items_example()
    
    # Query board example
    query_board_example()
    
    print("\n" + "="*50)
    print("Important Notes:")
    print("="*50)
    print("1. Make sure you have a Monday.com API key")
    print("2. Configure the MCP server in your Claude Desktop config")
    print("3. The MCP server handles all API authentication and requests")
    print("4. Use natural language commands through your MCP client")
    print("5. The server supports creating boards, items, updating data, and queries")

# Made with Bob
