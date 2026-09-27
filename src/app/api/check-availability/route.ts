import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface ConflictDetails {
  subject: string;
  professor: string;
  startTime: string;
  endTime: string;
  room: string;
  classType: string;
}

export async function POST(req: NextRequest) {
  try {
    const { professorName, day, startTime, endTime } = await req.json();

    if (!professorName || !day || !startTime || !endTime) {
      return NextResponse.json(
        {
          error: "Missing required fields: professorName, day, startTime, endTime",
        },
        { status: 400 },
      );
    }

    const checkedParams = { professorName, day, startTime, endTime };

    // 1. Check if professor exists in Timings
    const professorExists = await prisma.timings.findFirst({
      where: {
        Teacher: professorName,
      },
      select: { id: true },
    });

    if (!professorExists) {
      return NextResponse.json({
        available: false,
        checked: checkedParams,
        message: `Professor ${professorName} does not appear to have scheduled classes this semester.`,
      });
    }

    // 2. Query for conflicts
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

    if (conflicts.length === 0) {
      return NextResponse.json({
        available: true,
        checked: checkedParams,
      });
    } else {
      const conflictDetails: ConflictDetails[] = conflicts.map((c) => ({
        subject: c.SubCode,
        classType: c.Class,
        professor: c.Teacher,
        startTime: c.StartTime,
        endTime: c.EndTime,
        room: c.Room,
      }));

      return NextResponse.json({
        available: false,
        checked: checkedParams,
        classes: conflictDetails,
      });
    }
  } catch (error: any) {
    console.error("[API Check Availability] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
