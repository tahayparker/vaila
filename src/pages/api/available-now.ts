// src/pages/api/available-now.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { DateTime } from "luxon";

const DUBAI_TIMEZONE = "Asia/Dubai";

interface ProfessorInfo {
  name: string;
}
interface ApiResponseData {
  checkedAt: string;
  professors: ProfessorInfo[];
}
interface ApiErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseData | ApiErrorResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
  console.log("[API Available Now - Refined] Request received.");

  try {
    // --- Get Current Time in Dubai ---
    const nowLuxon = DateTime.now().setZone(DUBAI_TIMEZONE);
    const currentTimeStringDubai = nowLuxon.toFormat("HH:mm");
    const currentDayNameDubai = nowLuxon.toFormat("EEEE");
    console.log(
      `[API Available Now - Refined] Checking for Day: ${currentDayNameDubai}, Time: ${currentTimeStringDubai}`,
    );

    // --- Database Queries ---
    // 1. Get ALL distinct, non-placeholder teacher names from the Timings table (Relevant Teachers)
    console.log(
      "[API Available Now - Refined] Fetching relevant teachers from Timings...",
    );
    const relevantTimings = await prisma.timings.findMany({
      select: { Teacher: true },
      distinct: ["Teacher"],
    });
    const relevantTeacherNames = relevantTimings.map((t) => t.Teacher);
    console.log(
      `[API Available Now - Refined] Found ${relevantTeacherNames.length} relevant teachers.`,
    );

    // 2. Find distinct teachers BOOKED right now
    console.log(
      "[API Available Now - Refined] Fetching booked teachers for current time...",
    );
    const bookedTimings = await prisma.timings.findMany({
      where: {
        Day: currentDayNameDubai,
        StartTime: { lte: currentTimeStringDubai },
        EndTime: { gt: currentTimeStringDubai },
      },
      select: { Teacher: true },
      distinct: ["Teacher"],
    });
    const bookedProfessorNames = bookedTimings.map((timing) => timing.Teacher);
    console.log(
      `[API Available Now - Refined] Found ${bookedProfessorNames.length} booked teachers.`,
    );

    // --- Calculate Available Teachers ---
    const bookedSet = new Set(bookedProfessorNames);
    const availableNames = relevantTeacherNames.filter(
      (name) => !bookedSet.has(name),
    );
    console.log(
      `[API Available Now - Refined] Calculated ${availableNames.length} available teachers.`,
    );

    // Sort alphabetically
    availableNames.sort((a, b) => a.localeCompare(b));

    // Map to API response format
    const availableProfessors: ProfessorInfo[] = availableNames.map((name) => ({
      name,
    }));

    const checkedAtUTC = nowLuxon.toISO();

    res.status(200).json({
      checkedAt: checkedAtUTC ?? new Date().toISOString(),
      professors: availableProfessors,
    });
  } catch (error: any) {
    console.error("[API Available Now - Refined] Error:", error);
    if (error.code) {
      console.error(
        `[API Available Now - Refined] Prisma Error Code: ${error.code}`,
      );
    }
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  } finally {
    console.log("[API Available Now - Refined] Disconnecting Prisma...");
    await prisma
      .$disconnect()
      .catch((e) =>
        console.error(
          "[API Available Now - Refined] Error disconnecting Prisma:",
          e,
        ),
      );
    console.log("[API Available Now - Refined] Finished request.");
  }
}
