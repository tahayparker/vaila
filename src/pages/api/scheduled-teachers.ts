// src/pages/api/scheduled-teachers.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

// Define the simpler structure needed for the dropdown
interface ScheduledTeacherData {
  name: string;
}

type ResponseData = ScheduledTeacherData[] | { error: string };

// Placeholder names to filter out from Timings data
const PLACEHOLDER_TEACHER_NAMES = ["Unknown", "TBA", "Staff"]; // Adjust as needed

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  console.log(
    "[API Scheduled Teachers] Fetching distinct teachers from Timings table...",
  );

  try {
    // Query the Timings table for distinct teachers actually scheduled
    const distinctTimings = await prisma.timings.findMany({
      select: {
        Teacher: true, // Select only the teacher name
      },
      distinct: ["Teacher"], // Get only unique names
      where: {
        // Filter out common placeholders found in Timings
        NOT: {
          Teacher: {
            in: PLACEHOLDER_TEACHER_NAMES,
            // mode: 'insensitive' // Optional: Use if casing might vary
          },
        },
      },
      orderBy: {
        Teacher: "asc", // Order alphabetically by Name
      },
    });

    // Map the result to the simple { name: string } structure
    const responseData: ScheduledTeacherData[] = distinctTimings
      .filter((timing) => timing.Teacher && timing.Teacher.trim() !== "") // Ensure name is not null/empty
      .map((timing) => ({
        name: timing.Teacher,
      }));

    console.log(
      `[API Scheduled Teachers] Fetched ${responseData.length} distinct scheduled teachers.`,
    );
    return res.status(200).json(responseData);
  } catch (error: any) {
    console.error(
      "[API Scheduled Teachers] Error fetching distinct teachers from Timings:",
      error,
    );
    if (error.code) {
      console.error(
        `[API Scheduled Teachers] Prisma Error Code: ${error.code}`,
      );
    }
    await prisma
      .$disconnect()
      .catch((e) =>
        console.error(
          "[API Scheduled Teachers] Error disconnecting Prisma on error:",
          e,
        ),
      );
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma
      .$disconnect()
      .catch((e) =>
        console.error(
          "[API Scheduled Teachers] Error disconnecting Prisma in finally:",
          e,
        ),
      );
    console.log("[API Scheduled Teachers] Request finished.");
  }
}
