// src/pages/api/schedule.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
// ** REMOVED: import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server'; **

// Define the expected structure from the JSON file
interface FrontendProfessorData {
  professor: string;
  availability: number[];
}

interface FrontendScheduleDay {
  day: string;
  professors: FrontendProfessorData[];
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FrontendScheduleDay[] | { error: string }>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // --- REMOVED Authentication Check ---
  // Middleware should handle protecting this route if needed.
  // ---

  const GITHUB_JSON_URL = "https://raw.githubusercontent.com/tahayparker/vaila/refs/heads/main/public/scheduleData.json";

  // First, try to fetch from GitHub
  try {
    console.log("[API Schedule] Attempting to fetch from GitHub...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const githubResponse = await fetch(GITHUB_JSON_URL, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (githubResponse.ok) {
      const scheduleData: FrontendScheduleDay[] = await githubResponse.json();
      if (Array.isArray(scheduleData)) {
        console.log("[API Schedule] Successfully fetched data from GitHub");
        return res.status(200).json(scheduleData);
      } else {
        throw new Error("GitHub data is not an array");
      }
    } else {
      throw new Error(`GitHub fetch failed with status: ${githubResponse.status}`);
    }
  } catch (githubError: any) {
    console.warn(`[API Schedule] GitHub fetch failed: ${githubError.message}, falling back to local file...`);
  }

  // Fallback to local file
  try {
    console.log("[API Schedule] Attempting to read local scheduleData.json...");
    const schedulePath = path.join(
      process.cwd(),
      "public",
      "scheduleData.json",
    );
    if (!fs.existsSync(schedulePath)) {
      console.error(`Schedule data file not found at: ${schedulePath}`);
      return res.status(404).json({ error: "Schedule data file not found" });
    }
    const fileContents = fs.readFileSync(schedulePath, "utf8");
    const scheduleData: FrontendScheduleDay[] = JSON.parse(fileContents);
    if (!Array.isArray(scheduleData)) {
      throw new Error("Invalid data format: scheduleData is not an array.");
    }
    console.log("[API Schedule] Successfully read local scheduleData.json");
    return res.status(200).json(scheduleData);
  } catch (error: any) {
    console.error("Error reading or parsing local schedule data:", error);
    if (error instanceof SyntaxError) {
      return res
        .status(500)
        .json({ error: "Failed to parse schedule data: Invalid JSON format." });
    }
    return res
      .status(500)
      .json({ error: "Internal Server Error reading schedule data" });
  }
}
