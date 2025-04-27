// src/pages/api/teachers.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

// Define the structure for the response data
interface TeacherListData {
  name: string;
  email: string | null;
  phone: string | null;
}

type ResponseData = TeacherListData[] | { error: string };

// Keywords to filter OUT from the main /teachers page list
const FILTER_KEYWORDS_MASTER = [
  "instructor",
  "adjunct",
  "tba",
  "new ",
  " ps",
  "unknown",
  "staff",
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  console.log(
    "[API Teachers - Master List] Fetching full teacher details from Teacher table...",
  );

  try {
    // Fetch teacher details from the master Teacher table
    const teachers = await prisma.teacher.findMany({
      select: {
        Name: true,
        Email: true,
        Phone: true,
      },
      where: {
        // Filter out placeholders from the master list based on Name
        NOT: {
          OR: FILTER_KEYWORDS_MASTER.map((keyword) => ({
            Name: { contains: keyword, mode: "insensitive" }, // Case-insensitive contains check
          })),
        },
      },
      orderBy: {
        Name: "asc", // Order alphabetically by Name
      },
    });

    // Map to the desired response structure
    const responseData: TeacherListData[] = teachers.map((teacher) => ({
      name: teacher.Name,
      email: teacher.Email ?? null,
      phone: teacher.Phone ?? null,
    }));

    console.log(
      `[API Teachers - Master List] Fetched ${responseData.length} teachers after filtering.`,
    );
    return res.status(200).json(responseData);
  } catch (error: any) {
    console.error(
      "[API Teachers - Master List] Error fetching teachers:",
      error,
    );
    if (error.code) {
      console.error(
        `[API Teachers - Master List] Prisma Error Code: ${error.code}`,
      );
    }
    await prisma
      .$disconnect()
      .catch((e) =>
        console.error(
          "[API Teachers - Master List] Error disconnecting Prisma on error:",
          e,
        ),
      );
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma
      .$disconnect()
      .catch((e) =>
        console.error(
          "[API Teachers - Master List] Error disconnecting Prisma in finally:",
          e,
        ),
      );
    console.log("[API Teachers - Master List] Request finished.");
  }
}
