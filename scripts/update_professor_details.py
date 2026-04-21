#!/usr/bin/env python3
# scripts/update_professor_details.py
"""
Script to update professor contact details in the database.
Usage: python update_professor_details.py <name> [--email <email>] [--phone <phone>]
"""

import sys
import argparse
import traceback
from typing import Optional

# Third-party imports
from postgrest.exceptions import APIError
from httpx import RequestError, HTTPStatusError

# Local imports
from db_connection import get_supabase_client

# --- Configuration ---
TEACHER_TABLE = "Teacher"

# --- Supabase Client Initialization ---
try:
    supabase = get_supabase_client()
except ValueError as config_err:
    print(f"Configuration Error: {config_err}", file=sys.stderr)
    sys.exit("Exiting due to missing Supabase configuration.")
except Exception as init_err:
    print(f"Unexpected error initializing Supabase client: {init_err}", file=sys.stderr)
    sys.exit("Exiting due to Supabase client initialization failure.")

# --- Functions ---

def update_professor_details(name: str, email: Optional[str] = None, phone: Optional[str] = None) -> bool:
    """
    Updates professor contact details in the database.

    Args:
        name: Professor's full name (case-insensitive search)
        email: Email address to update (optional)
        phone: Phone number to update (optional)

    Returns:
        bool: True if update was successful, False otherwise
    """
    if not name or not name.strip():
        print("Error: Professor name is required and cannot be empty.", file=sys.stderr)
        return False

    # Skip "[Not provided]" values
    if email == "[Not provided]" or (email and email.strip() == "[Not provided]"):
        email = None
    if phone == "[Not provided]" or (phone and phone.strip() == "[Not provided]"):
        phone = None

    # Check if at least one field is being updated
    if not email and not phone:
        print("Error: At least one contact detail (email or phone) must be provided for update.", file=sys.stderr)
        return False

    name = name.strip()

    try:
        # Build update data
        update_data = {}
        if email and email.strip():
            update_data["Email"] = email.strip()
        if phone and phone.strip():
            update_data["Phone"] = phone.strip()

        print(f"Attempting to update professor: {name}")
        print(f"Update data: {update_data}")

        # First, check if professor exists (case-insensitive)
        search_response = supabase.table(TEACHER_TABLE).select("*").ilike("Name", name).execute()

        if not search_response.data:
            print(f"Error: Professor '{name}' not found in database.", file=sys.stderr)
            return False

        if len(search_response.data) > 1:
            print(f"Warning: Multiple professors found with similar names to '{name}':")
            for prof in search_response.data:
                print(f"  - {prof.get('Name', 'Unknown')}")
            print("Using the first match for update.")

        # Get the exact name from database for precise update
        exact_professor = search_response.data[0]
        exact_name = exact_professor.get("Name")

        print(f"Found professor in database: {exact_name}")

        # Perform the update using exact name match
        update_response = supabase.table(TEACHER_TABLE).update(update_data).eq("Name", exact_name).execute()

        if update_response.data and len(update_response.data) > 0:
            updated_professor = update_response.data[0]
            print(f"Successfully updated professor: {updated_professor.get('Name')}")

            # Show what was updated
            updated_fields = []
            if email:
                updated_fields.append(f"Email: {updated_professor.get('Email', 'N/A')}")
            if phone:
                updated_fields.append(f"Phone: {updated_professor.get('Phone', 'N/A')}")

            print(f"Updated fields: {', '.join(updated_fields)}")
            return True
        else:
            print("Error: Update operation completed but no records were affected.", file=sys.stderr)
            return False

    except (APIError, RequestError, HTTPStatusError) as db_err:
        print(f"Database error updating professor: {type(db_err).__name__} - {db_err}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"Unexpected error updating professor: {e}", file=sys.stderr)
        traceback.print_exc()
        return False

def main():
    """Main function to parse arguments and update professor details."""
    parser = argparse.ArgumentParser(
        description="Update professor contact details in the database",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python update_professor_details.py "John Smith" --email "john.smith@uowdubai.ac.ae"
  python update_professor_details.py "Jane Doe" --phone "1234"
  python update_professor_details.py "Bob Wilson" --email "bob@uowdubai.ac.ae" --phone "+97155555555"
        """
    )

    parser.add_argument("name", help="Professor's full name")
    parser.add_argument("--email", help="Email address to update")
    parser.add_argument("--phone", help="Phone number to update")

    args = parser.parse_args()

    # Validate that at least one contact detail is provided
    if not args.email and not args.phone:
        print("Error: At least one contact detail (--email or --phone) must be provided.", file=sys.stderr)
        parser.print_help()
        sys.exit(1)

    try:
        success = update_professor_details(args.name, args.email, args.phone)

        if success:
            print("Professor details updated successfully.")
            sys.exit(0)
        else:
            print("Failed to update professor details.", file=sys.stderr)
            sys.exit(1)

    except KeyboardInterrupt:
        print("\nOperation cancelled by user.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Script failed with unexpected error: {e}", file=sys.stderr)
        traceback.print_exc()
        sys.exit(1)
    finally:
        # Attempt to disconnect (if supported by the client)
        try:
            supabase.rpc("disconnect_db", {})
        except:
            pass  # Ignore disconnect errors
        print("Database connection closed.")

if __name__ == "__main__":
    main()
