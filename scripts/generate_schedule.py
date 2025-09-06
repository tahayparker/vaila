# \scripts\generate_schedule.py
# Modified for Professor Availability
# pylint: disable=invalid-name, broad-except, logging-fstring-interpolation

import json
import sys
import traceback
from pathlib import Path
from collections import defaultdict
from typing import List, Dict, Any, Tuple, DefaultDict, Set

# Third-party imports
from postgrest.exceptions import APIError
from httpx import RequestError

# Local imports
from db_connection import get_supabase_client

# --- Constants ---
DAYS_OF_WEEK = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
]
TIME_SLOTS = [ # Keep time slots as defined
    "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
    "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00",
    "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00",
    "20:30", "21:00", "21:30", "22:00", "22:30",
]
SCRIPT_DIR = Path(__file__).parent
# Output file remains the same, but content structure will change
OUTPUT_JSON_PATH = SCRIPT_DIR.parent / "public" / "scheduleData.json"

# --- Supabase Client Initialization ---
try:
    supabase = get_supabase_client()
except ValueError as config_err:
    print(f"Configuration Error: {config_err}", file=sys.stderr)
    sys.exit("Exiting due to missing Supabase configuration.")
except Exception as init_err:
    print(f"Unexpected error initializing Supabase client: {init_err}", file=sys.stderr)
    sys.exit("Exiting due to Supabase client initialization failure.")

# --- Type Alias for Clarity ---
# TimingsDict now maps: Day -> Teacher Name -> List of (StartTime, EndTime) tuples
ProfessorTimingsDict = DefaultDict[str, DefaultDict[str, List[Tuple[str, str]]]]

# --- Functions ---

def fetch_scheduled_teachers() -> List[str]:
    """
    Fetches unique teacher names from the 'Timings' table.
    Returns a sorted list of teacher names.
    """
    print("Fetching scheduled teachers from Timings data...")
    teacher_names: Set[str] = set()
    try:
        response = (
            supabase.table("Timings")
            .select("Teacher")
            .neq("Teacher", None) # Ensure Teacher is not null
            .order("Teacher") # Add explicit ordering for consistency
            .execute()
        )

        if response.data:
            count = 0
            for timing in response.data:
                teacher = timing.get("Teacher")
                if teacher and teacher.strip():
                    teacher_names.add(teacher.strip())
                    count += 1
            print(f"Found {len(teacher_names)} unique scheduled teachers from {count} relevant timing entries.")
            # Return sorted list
            return sorted(list(teacher_names))
        else:
            print("No timings found in the database.")
            return []
    except (APIError, RequestError) as db_err:
        print(f"Error fetching teachers from Timings: {type(db_err).__name__} - {db_err}", file=sys.stderr)
    except Exception as e:
        print(f"Unexpected error fetching teachers from Timings: {e}", file=sys.stderr)
        traceback.print_exc()

    raise RuntimeError("Failed to fetch scheduled teachers data.")


def fetch_all_professor_timings() -> ProfessorTimingsDict:
    """
    Fetches all timings and organizes them by Day and Teacher Name.
    Returns defaultdict: timings_by_day[day][teacher_name] = list of (start, end)
    """
    print("Fetching all timings from Supabase and grouping by Professor...")
    timings_by_day: ProfessorTimingsDict = defaultdict(lambda: defaultdict(list))
    try:
        # Select columns needed for grouping
        response = (
            supabase.table("Timings")
            .select("Day, Teacher, StartTime, EndTime")
            .neq("Teacher", None) # Ensure Teacher is not null
            .order("Day, Teacher, StartTime") # Add explicit ordering for consistency
            .execute()
        )

        if response.data:
            processed_count = 0
            for timing in response.data:
                day = timing.get("Day")
                teacher_name = timing.get("Teacher")
                start_time = timing.get("StartTime")
                end_time = timing.get("EndTime")

                # Validate data - include all teachers
                if day and teacher_name and start_time and end_time and teacher_name.strip():
                    # Group by Day, then by Teacher Name
                    timings_by_day[day][teacher_name.strip()].append((start_time, end_time))
                    processed_count += 1

            print(f"Fetched and processed {processed_count} valid timing entries for professors.")
            return timings_by_day
        else:
            print("No timings found in the database.")
            return timings_by_day
    except (APIError, RequestError) as db_err:
        print(f"Error fetching timings: {type(db_err).__name__} - {db_err}", file=sys.stderr)
    except Exception as e:
        print(f"Unexpected error fetching timings: {e}", file=sys.stderr)
        traceback.print_exc()

    raise RuntimeError("Failed to fetch timings data.")


def is_professor_available(
    slot_start: str, slot_end: str, professor_timings: List[Tuple[str, str]]
) -> bool:
    """
    Checks if a given time slot overlaps with any existing timings for a professor.
    (Logic is identical to room availability check, just different context).
    """
    for timing_start, timing_end in professor_timings:
        # Check for overlap: timing starts before slot ends AND timing ends after slot starts
        if timing_start < slot_end and timing_end > slot_start:
            return False # Occupied (Overlap found)
    return True # Available (No overlap found)


def generate_professor_schedule(
    teachers_to_schedule: List[str], all_timings: ProfessorTimingsDict
) -> List[Dict[str, Any]]:
    """
    Generates schedule availability data for given professors and their timings.
    Outputs professor names in the JSON.
    """
    print("Starting professor schedule data generation...")
    schedule: List[Dict[str, Any]] = []

    for day in DAYS_OF_WEEK:
        print(f"Processing day: {day}")
        # *** UPDATED: Structure uses "professors" key ***
        day_data: Dict[str, Any] = {"day": day, "professors": []}
        timings_for_day = all_timings.get(day, defaultdict(list))

        for teacher_name in teachers_to_schedule:
            # *** UPDATED: Structure uses "professor" key ***
            prof_output_data = {"professor": teacher_name, "availability": []}
            timings_for_this_prof = timings_for_day.get(teacher_name, [])

            slot_count = len(TIME_SLOTS)
            for i in range(slot_count - 1): # Iterate through pairs of time slots
                start_time = TIME_SLOTS[i]
                end_time = TIME_SLOTS[i + 1]

                # Check availability for this professor during this slot
                available = is_professor_available(
                    start_time, end_time, timings_for_this_prof
                )
                # Append 1 for available, 0 for busy
                prof_output_data["availability"].append(1 if available else 0)

            # Append this professor's availability data for the day
            day_data["professors"].append(prof_output_data)

        # Append the whole day's data to the schedule
        schedule.append(day_data)

    print("Professor schedule data generation complete.")
    return schedule


def save_schedule_to_json(schedule_data: List[Dict[str, Any]]) -> bool:
    """Saves the generated schedule data to a JSON file. Returns True on success."""
    print(f"Saving professor schedule data to JSON file: {OUTPUT_JSON_PATH}...")
    try:
        OUTPUT_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
        with OUTPUT_JSON_PATH.open("w", encoding="utf-8") as file:
            # Dump the new structure to the same file path
            json.dump(schedule_data, file, indent=2)
        print(f"Professor schedule data saved successfully to {OUTPUT_JSON_PATH.resolve()}")
        return True
    except (IOError, OSError) as file_err:
        print(f"Error saving JSON file: {file_err}", file=sys.stderr)
    except TypeError as json_err:
        print(f"Error converting data to JSON: {json_err}", file=sys.stderr)
    except Exception as e:
        print(f"An unexpected error occurred during JSON saving: {e}", file=sys.stderr)
        traceback.print_exc()

    return False


# --- Main Execution ---
if __name__ == "__main__":
    print("Starting professor schedule generation process...")
    final_success = False
    try:
        # Fetch the list of unique, relevant teachers from Timings
        scheduled_teacher_list = fetch_scheduled_teachers()
        # Fetch all timings grouped by day and teacher
        all_professor_timings_data = fetch_all_professor_timings()

        if scheduled_teacher_list:
            # Generate the availability data for these teachers
            generated_schedule = generate_professor_schedule(
                scheduled_teacher_list, all_professor_timings_data
            )
            # Save the result to the JSON file
            final_success = save_schedule_to_json(generated_schedule)
        else:
            print("Cannot generate schedule as no scheduled teachers were found.")
            final_success = False

    except (RuntimeError, Exception) as main_err:
        print(f"Script failed: {main_err}", file=sys.stderr)
        final_success = False
    finally:
        # Attempt to disconnect
        supabase.rpc("disconnect_db", {}) # Or appropriate disconnect method
        print("Supabase client disconnected (attempted).")


    if final_success:
        print("Script finished successfully.")
        sys.exit(0)
    else:
        print("Script finished with errors.", file=sys.stderr)
        sys.exit(1)