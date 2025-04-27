# vaila 🧑‍🏫

[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/built-with-resentment.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/for-you.svg)](https://forthebadge.com)

A modern web application designed to help students and staff quickly check professor schedules and potential availability, based on university timetable data.

## Features 🚀

- **Real-time "Available Now" Check:** Instantly see which professors are likely _not_ in scheduled classes right now.
- **"Available Soon" Projections:** Check potential professor availability in the near future (e.g., 30 mins, 1 hour).
- **Check Specific Availability:** Look up a specific professor and time slot to see if they have a scheduled class then.
- **Professor Directory:** Browse a list of professors with quick contact actions (Email, Phone).
- **Interactive Schedule Graph:** Visualize the weekly schedule for professors in an interactive grid.
- **Search Functionality:** Search for specific professors when checking availability.
- **Automatic Data Updates:** Timetable data is updated every 4 hours to stay reasonably current.
- **Mobile Responsive:** Works seamlessly on desktop and mobile devices.

## Tech Stack 💻

- **Frontend:** Next.js (Pages Router), React, TypeScript
- **UI:** Tailwind CSS, Shadcn UI, Framer Motion
- **Icons:** Lucide Icons (`lucide-react`)
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (hosted on Supabase)
- **ORM:** Prisma
- **Deployment & Analytics:** Vercel (`@vercel/analytics`, `@vercel/speed-insights`)
- **Data Handling/Scripts:** Python (`supabase-py`, `cloudscraper`, `beautifulsoup4`), GitHub Actions
- **Utility Libraries:** Fuse.js (Search), Luxon & date-fns (Dates/Times)

## Getting Started 🏁

### Prerequisites

- Node.js 18+ (Aligned with current Next.js recommendations)
- npm or yarn
- Python 3.8+ (for running scripts)
- Access to a Supabase project (for database and env variables)

### Installation

1.  Clone the repository (Update URL if necessary)

    ```bash
    git clone https://github.com/tahayparker/vaila.git
    cd vaila
    ```

2.  Install Node.js dependencies

    ```bash
    npm install
    # or
    yarn install
    ```

3.  Install Python dependencies (preferably in a virtual environment)

    ```bash
    pip install -r requirements.txt
    ```

4.  Set up environment variables

    ```bash
    # Create a .env file in the root directory with the following variables
    # from your Supabase project settings:

    SUPABASE_URL="YOUR_SUPABASE_URL"
    SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY" # Required for scripts

    NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

    # From Database settings -> Connection string -> URI (for Prisma)
    DATABASE_URL="postgresql://..."

    # Optional: DIRECT_URL might be needed if pooling causes issues with migrations
    # DIRECT_URL="postgresql://..."
    ```

5.  Initialize/Sync the database schema

    ```bash
    npx prisma db push
    ```

6.  (Optional but Recommended) Populate/Update local data:
    Run these scripts sequentially from the root directory. The database (`Timings` table) needs to be populated first (manually or via restore) for these to be fully effective.

    ```bash
    # 1. Scrape latest timetable into classes.csv
    python scripts/scrape_timetable.py --output public/classes.csv

    # 2. Add any new teachers found in classes.csv to the Teacher DB table
    python scripts/update_teachers.py

    # 3. Generate the professor availability JSON for the graph page
    python scripts/generate_schedule.py
    ```

7.  Run the development server
    ```bash
    npm run dev
    # or
    yarn dev
    ```

The application should be available at `http://localhost:3000`.

## Automatic Updates ⚡

The timetable data and derived availability information are automatically updated every 4 hours using a GitHub Actions workflow. The workflow performs the following steps:

1.  Scrapes the latest timetable data from the source website (`scrape_timetable.py`) -> `public/classes.csv`.
2.  Updates the `Teacher` database table with any new professors found in the scraped data (`update_teachers.py`).
3.  Generates the professor schedule JSON used by the Graph page (`generate_schedule.py`) -> `public/scheduleData.json`.
4.  Commits the updated `classes.csv` and `scheduleData.json` files back to the repository.

## Inspiration ✨

- Built for my friends so they can stop asking me when professors _might_ be free and finally use a website.
- Inspired by the need for a simpler way to check professor schedules.

## Acknowledgments 🙏

- Thank you Mom Dad for not kicking me out of the house
- Thank you Google for free usage of AI Studio
- Thank you UOWD for the timetable [website](https://my.uowdubai.ac.ae/timetable/viewer) (please keep it accessible!).

## Contact 📧

Taha Parker - [@tahayparker](https://github.com/tahayparker)

Project Link: [https://github.com/tahayparker/vaila](https://github.com/tahayparker/vaila) (Update if needed)

[![forthebadge](https://forthebadge.com/images/badges/open-source.svg)](https://forthebadge.com)[![forthebadge](https://forthebadge.com/images/badges/powered-by-black-magic.svg)](https://forthebadge.com)[![forthebadge](https://forthebadge.com/images/badges/it-works-dont-ask-me-how.svg)](https://forthebadge.com)
