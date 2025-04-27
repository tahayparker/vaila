// src/pages/api/available-soon.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { DateTime } from "luxon";

interface RequestBody {
  durationMinutes?: number;
}
interface ProfessorInfo {
  name: string;
}
type ResponseData =
  | { checkedAtFutureTime: string; professors: ProfessorInfo[] }
  | { error: string };

const DUBAI_TIMEZONE = "Asia/Dubai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  console.log("[API Available Soon - Refined] Request received.");

  try {
    // 1. Get Duration and Calculate Future Time
    const { durationMinutes = 30 } = req.body as RequestBody;
    if (typeof durationMinutes !== "number" || durationMinutes < 0) {
      return res
        .status(400)
        .json({ error: "Invalid durationMinutes parameter." });
    }
    const nowLuxon = DateTime.now().setZone(DUBAI_TIMEZONE);
    const futureTimeLuxon = nowLuxon.plus({ minutes: durationMinutes });
    const checkDayDubai = futureTimeLuxon.toFormat("EEEE");
    const checkTimeDubai = futureTimeLuxon.toFormat("HH:mm");
    console.log(
      `[API Available Soon - Refined] Checking for Day: ${checkDayDubai}, Future Time: ${checkTimeDubai} (${durationMinutes} mins from now)`,
    );
    if (!checkDayDubai) {
      return res
        .status(500)
        .json({ error: "Internal server error: Cannot determine check day." });
    }

    // --- Database Queries ---
    // 1. Get ALL distinct, non-placeholder teacher names from Timings (Relevant Teachers)
    console.log(
      "[API Available Soon - Refined] Fetching relevant teachers from Timings...",
    );
    const relevantTimings = await prisma.timings.findMany({
      select: { Teacher: true },
      distinct: ["Teacher"],
    });
    const relevantTeacherNames = relevantTimings.map((t) => t.Teacher);
    console.log(
      `[API Available Soon - Refined] Found ${relevantTeacherNames.length} relevant teachers.`,
    );

    // 2. Find distinct teachers BOOKED at the FUTURE time
    console.log(
      "[API Available Soon - Refined] Fetching occupied teachers for future time...",
    );
    const bookedTimingsResult = await prisma.timings.findMany({
      where: {
        Day: checkDayDubai,
        StartTime: { lte: checkTimeDubai },
        EndTime: { gt: checkTimeDubai },
      },
      select: { Teacher: true },
      distinct: ["Teacher"],
    });
    const occupiedProfessorNames = bookedTimingsResult.map(
      (timing) => timing.Teacher,
    );
    console.log(
      `[API Available Soon - Refined] Found ${occupiedProfessorNames.length} occupied teachers at future time.`,
    );

    // --- Calculate Available Teachers ---
    const occupiedSet = new Set(occupiedProfessorNames);
    const availableNames = relevantTeacherNames.filter(
      (name) => !occupiedSet.has(name),
    );
    console.log(
      `[API Available Soon - Refined] Calculated ${availableNames.length} available teachers at future time.`,
    );

    // Sort alphabetically
    availableNames.sort((a, b) => a.localeCompare(b));

    // Map to API response format
    const availableProfessors: ProfessorInfo[] = availableNames.map((name) => ({
      name,
    }));

    const responsePayload: ResponseData = {
      checkedAtFutureTime: futureTimeLuxon.toISO() ?? new Date().toISOString(),
      professors: availableProfessors,
    };

    console.log(
      "[API Available Soon - Refined] Sending final Available Professors Count:",
      responsePayload.professors.length,
    );
    return res.status(200).json(responsePayload);
  } catch (error: any) {
    console.error("[API Available Soon - Refined] Error:", error);
    if (error.code) {
      console.error(
        `[API Available Soon - Refined] Prisma Error Code: ${error.code}`,
      );
    }
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    console.log("[API Available Soon - Refined] Disconnecting Prisma...");
    await prisma
      .$disconnect()
      .catch((e) =>
        console.error(
          "[API Available Soon - Refined] Error disconnecting Prisma:",
          e,
        ),
      );
    console.log("[API Available Soon - Refined] Finished request.");
  }
}
