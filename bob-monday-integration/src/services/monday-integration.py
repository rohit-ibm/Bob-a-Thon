"""
Monday.com Integration Service for Bob Triage Engine

This script integrates with Monday.com API to automatically create tasks
from triage analysis results.

Usage:
  Integration mode: echo '{"type":"issue","title":"..."}' | python monday-integration.py
  Standalone mode: python monday-integration.py
"""

import sys
import io
import requests
import json
import os
from datetime import datetime

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Monday.com API Configuration
API_TOKEN = os.getenv('MONDAY_API_TOKEN', "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjY1MzI0MTQ0OSwiYWFpIjoxMSwidWlkIjo1Mzk0MTI5NywiaWFkIjoiMjAyNi0wNS0wNFQwNToyNjozNi4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTM1MzY5ODEsInJnbiI6InVzZTEifQ.csO7Z0vA0xkrE-_tFeicx6f8ds3qk6lVvpH_uBqZjbw")
API_URL = "https://api.monday.com/v2"

# Board Information
BOARD_ID = os.getenv('MONDAY_BOARD_ID', "18411696558")
BOARD_URL = f"https://ibm.monday.com/boards/{BOARD_ID}"
WORKSPACE = "SDN-COE-IND"

# Column IDs (from board schema)
STATUS_COLUMN = "color_mm32avc5"
PRIORITY_COLUMN = "color_mm32g01j"
ASSIGNEE_COLUMN = "multiple_person_mm32h5nj"

# Priority mapping from Bob to Monday.com
PRIORITY_MAPPING = {
    "critical": "Done",
    "high": "Working on it",
    "medium": "On Hold",
    "low": "Stuck"
}

# Status mapping based on type
STATUS_MAPPING = {
    "issue": "Stuck",
    "feature": "On Hold"
}


def execute_query(query, variables=None):
    """Execute a GraphQL query against Monday.com API"""
    headers = {
        "Authorization": API_TOKEN,
        "Content-Type": "application/json"
    }
    
    data = {"query": query}
    if variables:
        data["variables"] = variables
    
    response = requests.post(API_URL, json=data, headers=headers)
    
    if response.status_code != 200:
        raise Exception(f"Query failed with status code {response.status_code}: {response.text}")
    
    result = response.json()
    
    if "errors" in result:
        raise Exception(f"GraphQL errors: {result['errors']}")
    
    return result["data"]


def create_item(board_id, item_name, column_values):
    """Create a new item on the board"""
    query = """
    mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
        create_item(
            board_id: $boardId,
            item_name: $itemName,
            column_values: $columnValues
        ) {
            id
            name
        }
    }
    """
    
    variables = {
        "boardId": str(board_id),
        "itemName": item_name,
        "columnValues": json.dumps(column_values)
    }
    
    result = execute_query(query, variables)
    return result["create_item"]


def convert_triage_to_task(triage_data):
    """Convert Bob triage data to Monday.com task format"""
    task_type = triage_data.get("type", "issue")
    title = triage_data.get("title", "Untitled Task")
    description = triage_data.get("description", "")
    priority = triage_data.get("priority", "medium").lower()
    tracking_id = triage_data.get("tracking_id", "")
    
    # Create task name with tracking ID
    task_name = f"[{tracking_id}] {title}" if tracking_id else title
    
    # Map priority and status
    monday_priority = PRIORITY_MAPPING.get(priority, "On Hold")
    monday_status = STATUS_MAPPING.get(task_type, "On Hold")
    
    # Add type prefix to description
    type_label = "🐛 BUG REPORT" if task_type == "issue" else "✨ FEATURE REQUEST"
    full_description = f"{type_label}\n\n{description}"
    
    return {
        "name": task_name,
        "status": monday_status,
        "priority": monday_priority,
        "description": full_description,
        "type": task_type,
        "tracking_id": tracking_id
    }


def read_input_from_stdin():
    """Read JSON input from stdin for integration with Bob"""
    try:
        if not sys.stdin.isatty():
            input_data = sys.stdin.read().strip()
            if input_data:
                return json.loads(input_data)
    except Exception as e:
        print(f"[WARNING] Could not read from stdin: {str(e)}", file=sys.stderr)
    return None


def create_task_from_triage(triage_data):
    """Create a Monday.com task from triage analysis data"""
    try:
        task = convert_triage_to_task(triage_data)
        
        print(f"Creating task: {task['name']}")
        print(f"  Type: {task['type']}")
        print(f"  Priority: {task['priority']}")
        print(f"  Status: {task['status']}")
        
        column_values = {
            STATUS_COLUMN: {"label": task["status"]},
            PRIORITY_COLUMN: {"label": task["priority"]}
        }
        
        item = create_item(BOARD_ID, task["name"], column_values)
        
        result = {
            "success": True,
            "item_id": item["id"],
            "item_name": item["name"],
            "board_url": f"{BOARD_URL}/pulses/{item['id']}",
            "tracking_id": task.get("tracking_id", ""),
            "type": task["type"]
        }
        
        print(f"[SUCCESS] Task created with ID: {item['id']}")
        print(f"View at: {result['board_url']}")
        
        print("\n" + "="*70)
        print(json.dumps(result, indent=2))
        print("="*70)
        
        return result
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "tracking_id": triage_data.get("tracking_id", "")
        }
        print(f"[ERROR] {str(e)}", file=sys.stderr)
        print(json.dumps(error_result, indent=2))
        return error_result


def main():
    """Main function"""
    stdin_data = read_input_from_stdin()
    
    if stdin_data:
        print("[INFO] Running in integration mode - processing triage data from stdin\n")
        create_task_from_triage(stdin_data)
    else:
        print("[INFO] Running in standalone mode - creating sample task\n")
        
        sample_task = {
            "type": "issue",
            "title": "Sample Bug Report",
            "description": "This is a sample bug report for testing",
            "priority": "medium",
            "tracking_id": "ISS-SAMPLE-001"
        }
        
        create_task_from_triage(sample_task)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n[ERROR] {str(e)}", file=sys.stderr)
        print("\nPlease check your API token and board configuration.", file=sys.stderr)
        sys.exit(1)

# Made with Bob