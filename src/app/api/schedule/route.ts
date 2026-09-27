import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

interface FrontendProfessorData {
  professor: string;
  availability: number[];
}

interface FrontendScheduleDay {
  day: string;
  professors: FrontendProfessorData[];
}

export async function GET() {
  const GITHUB_JSON_URL =
    "https://raw.githubusercontent.com/tahayparker/vaila/refs/heads/main/public/scheduleData.json";

  // First, try to fetch from GitHub
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const githubResponse = await fetch(GITHUB_JSON_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (githubResponse.ok) {
      const scheduleData: FrontendScheduleDay[] = await githubResponse.json();
      if (Array.isArray(scheduleData)) {
        return NextResponse.json(scheduleData);
      }
    }
  } catch (githubError: any) {
    console.warn(
      `[API Schedule] GitHub fetch failed: ${githubError.message}, falling back to local file...`,
    );
  }

  // Fallback to local file
  try {
    const schedulePath = path.join(
      process.cwd(),
      "public",
      "scheduleData.json",
    );
    if (!fs.existsSync(schedulePath)) {
      return NextResponse.json(
        { error: "Schedule data file not found" },
        { status: 404 },
      );
    }
    const fileContents = fs.readFileSync(schedulePath, "utf8");
    const scheduleData: FrontendScheduleDay[] = JSON.parse(fileContents);
    if (!Array.isArray(scheduleData)) {
      return NextResponse.json(
        { error: "Invalid data format: scheduleData is not an array." },
        { status: 500 },
      );
    }
    return NextResponse.json(scheduleData);
  } catch (error: any) {
    console.error("Error reading or parsing local schedule data:", error);
    return NextResponse.json(
      { error: "Internal Server Error reading schedule data" },
      { status: 500 },
    );
  }
}
