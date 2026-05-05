"""
Add Tasks to SOE Boathon Board

This script adds tasks to the SOE Boathon Monday board using the Monday.com API.
Can be run standalone or accept JSON input from stdin for integration with ai-agent-bob.

Usage:
  Standalone: python add_tasks_to_board.py
  With input: echo '{"type":"issue","title":"Bug fix","description":"...","priority":"high"}' | python add_tasks_to_board.py
"""

import sys
import io
import requests
import json
from datetime import datetime

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Monday.com API Configuration
API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjY1MzI0MTQ0OSwiYWFpIjoxMSwidWlkIjo1Mzk0MTI5NywiaWFkIjoiMjAyNi0wNS0wNFQwNToyNjozNi4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTM1MzY5ODEsInJnbiI6InVzZTEifQ.csO7Z0vA0xkrE-_tFeicx6f8ds3qk6lVvpH_uBqZjbw"
API_URL = "https://api.monday.com/v2"

# Board Information
BOARD_ID = "18411696558"  # SOE Boathon board
BOARD_URL = "https://ibm.monday.com/boards/18411696558"
WORKSPACE = "SDN-COE-IND"

# Column IDs (from board schema)
STATUS_COLUMN = "color_mm32avc5"
PRIORITY_COLUMN = "color_mm32g01j"
ASSIGNEE_COLUMN = "multiple_person_mm32h5nj"

# Priority mapping from ai-agent-bob to Monday.com
PRIORITY_MAPPING = {
    "critical": "Done",  # Highest priority in Monday
    "high": "Working on it",
    "medium": "On Hold",
    "low": "Stuck"
}

# Status mapping based on type
STATUS_MAPPING = {
    "issue": "Stuck",  # Issues start as "Stuck" (needs attention)
    "feature": "On Hold"  # Features start as "On Hold" (backlog)
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
    """Convert ai-agent-bob triage data to Monday.com task format"""
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
    """Read JSON input from stdin for integration with ai-agent-bob"""
    try:
        # Check if there's data in stdin
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
        # Convert triage data to task format
        task = convert_triage_to_task(triage_data)
        
        print(f"Creating task: {task['name']}")
        print(f"  Type: {task['type']}")
        print(f"  Priority: {task['priority']}")
        print(f"  Status: {task['status']}")
        
        # Prepare column values
        column_values = {
            STATUS_COLUMN: {"label": task["status"]},
            PRIORITY_COLUMN: {"label": task["priority"]}
        }
        
        # Create the item
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
        
        # Output JSON result for integration
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


def print_board_info():
    """Print board information"""
    print("=" * 70)
    print("SOE Boathon Board - Task Creation Script")
    print("=" * 70)
    print(f"Board ID: {BOARD_ID}")
    print(f"Board URL: {BOARD_URL}")
    print(f"Workspace: {WORKSPACE}")
    print()
    print("Columns:")
    print(f"  - Status: {STATUS_COLUMN}")
    print(f"  - Priority: {PRIORITY_COLUMN}")
    print(f"  - Assignee: {ASSIGNEE_COLUMN}")
    print("=" * 70)
    print()


def main():
    """Main function to add tasks to the board"""
    print_board_info()
    
    # Check if input is provided via stdin (integration mode)
    stdin_data = read_input_from_stdin()
    
    if stdin_data:
        print("[INFO] Running in integration mode - processing triage data from stdin\n")
        create_task_from_triage(stdin_data)
    else:
        # Standalone mode - create sample tasks
        print("[INFO] Running in standalone mode - creating sample tasks\n")
        
        sample_tasks = [
            {
                "type": "issue",
                "title": "Login button not working on mobile",
                "description": "Users report that the login button is unresponsive on iOS devices",
                "priority": "high",
                "tracking_id": "ISS-TEST-001"
            },
            {
                "type": "feature",
                "title": "Add dark mode support",
                "description": "Implement dark mode theme for better user experience",
                "priority": "medium",
                "tracking_id": "FTR-TEST-001"
            }
        ]
        
        print(f"Creating {len(sample_tasks)} sample tasks...\n")
        
        for i, task_data in enumerate(sample_tasks, 1):
            print(f"\n{i}. Processing task...")
            create_task_from_triage(task_data)
            print()


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n[ERROR] {str(e)}", file=sys.stderr)
        print("\nPlease check your API token and board configuration.", file=sys.stderr)
        sys.exit(1)

# Made with Bob
