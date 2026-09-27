import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface ScheduledTeacherData {
  name: string;
}

const PLACEHOLDER_TEACHER_NAMES = ["Unknown", "TBA", "Staff"];

export async function GET() {
  try {
    const distinctTimings = await prisma.timings.findMany({
      select: {
        Teacher: true,
      },
      distinct: ["Teacher"],
      where: {
        NOT: {
          Teacher: {
            in: PLACEHOLDER_TEACHER_NAMES,
          },
        },
      },
      orderBy: {
        Teacher: "asc",
      },
    });

    const responseData: ScheduledTeacherData[] = distinctTimings
      .filter((timing) => timing.Teacher && timing.Teacher.trim() !== "")
      .map((timing) => ({
        name: timing.Teacher,
      }));

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("[API Scheduled Teachers] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
