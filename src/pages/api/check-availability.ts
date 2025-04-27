// src/pages/api/check-availability.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

// Interfaces remain the same
interface RequestBody {
  professorName?: string;
  day?: string;
  startTime?: string;
  endTime?: string;
}
interface ConflictDetails {
  subject: string;
  professor: string;
  startTime: string;
  endTime: string;
  room: string;
  classType: string;
}
type ResponseData =
  | {
      available: boolean;
      checked: {
        professorName: string;
        day: string;
        startTime: string;
        endTime: string;
      };
      classes?: ConflictDetails[];
      message?: string; // Added optional message field
    }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { professorName, day, startTime, endTime } = req.body as RequestBody;
  console.log("[API Check Availability - Refined] Received:", {
    professorName,
    day,
    startTime,
    endTime,
  });

  if (!professorName || !day || !startTime || !endTime) {
    return res.status(400).json({
      error: "Missing required fields: professorName, day, startTime, endTime",
    });
  }
  // Add more validation if needed (time format, day validity)

  // Prepare checked parameters for response
  const checkedParams = { professorName, day, startTime, endTime };

  try {
    // 1. *** NEW: Check if the professor exists in Timings at all ***
    console.log(
      `[API Check Availability - Refined] Checking existence for: ${professorName}`,
    );
    const professorExists = await prisma.timings.findFirst({
      where: {
        Teacher: professorName,
      },
      select: { id: true }, // Select minimal field just to check existence
    });

    if (!professorExists) {
      console.log(
        `[API Check Availability - Refined] Professor "${professorName}" not found in Timings data.`,
      );
      // Return a specific message indicating the professor isn't scheduled
      // We can treat this as 'unavailable' in the context of checking their schedule,
      // or return a different status/error if preferred. Let's use a message.
      return res.status(200).json({
        available: false, // Or true? Depends on interpretation. Let's say false as they can't be booked *or* free *within this schedule*.
        checked: checkedParams,
        message: `Professor ${professorName} does not appear to have scheduled classes this semester.`,
      });
    }
    console.log(
      `[API Check Availability - Refined] Professor "${professorName}" exists in Timings. Checking conflicts...`,
    );

    // 2. Query for Conflicts (Original Logic - only runs if professor exists in Timings)
    const conflicts = await prisma.timings.findMany({
      where: {
        Teacher: professorName,
        Day: day,
        StartTime: { lt: endTime },
        EndTime: { gt: startTime },
      },
      select: {
        SubCode: true,
        Class: true,
        Teacher: true,
        StartTime: true,
        EndTime: true,
        Room: true,
      },
      orderBy: {
        StartTime: "asc",
      },
    });

    const isAvailable = conflicts.length === 0;

    if (isAvailable) {
      console.log(
        `[API Check Availability - Refined] Professor "${professorName}" is AVAILABLE on ${day} from ${startTime} to ${endTime}`,
      );
      return res.status(200).json({ available: true, checked: checkedParams });
    } else {
      console.log(
        `[API Check Availability - Refined] Professor "${professorName}" is NOT AVAILABLE on ${day} from ${startTime} to ${endTime}. Conflicts:`,
        conflicts.length,
      );
      const conflictDetails: ConflictDetails[] = conflicts.map((c) => ({
        subject: c.SubCode,
        classType: c.Class,
        professor: c.Teacher,
        startTime: c.StartTime,
        endTime: c.EndTime,
        room: c.Room,
      }));

      return res.status(200).json({
        available: false,
        checked: checkedParams,
        classes: conflictDetails,
      });
    }
  } catch (error: any) {
    console.error("[API Check Availability - Refined] Error:", error);
    // Ensure Prisma disconnect happens even on unexpected errors
    await prisma
      .$disconnect()
      .catch((e) =>
        console.error(
          "[API Check Availability - Refined] Error disconnecting Prisma on error:",
          e,
        ),
      );
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // This might run twice if error caught above, but ensures disconnect
    await prisma
      .$disconnect()
      .catch((e) =>
        console.error(
          "[API Check Availability - Refined] Error disconnecting Prisma in finally:",
          e,
        ),
      );
    console.log("[API Check Availability - Refined] Request finished.");
  }
}
