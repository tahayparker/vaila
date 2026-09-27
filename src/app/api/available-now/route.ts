import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DateTime } from "luxon";

export const dynamic = "force-dynamic";

const DUBAI_TIMEZONE = "Asia/Dubai";

interface ProfessorInfo {
  name: string;
}

export async function POST() {
  try {
    const nowLuxon = DateTime.now().setZone(DUBAI_TIMEZONE);
    const currentTimeStringDubai = nowLuxon.toFormat("HH:mm");
    const currentDayNameDubai = nowLuxon.toFormat("EEEE");

    // 1. Get ALL distinct teacher names from the Timings table
    const relevantTimings = await prisma.timings.findMany({
      select: { Teacher: true },
      distinct: ["Teacher"],
    });
    const relevantTeacherNames = relevantTimings.map((t) => t.Teacher);

    // 2. Find distinct teachers BOOKED right now
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

    // 3. Calculate Available Teachers
    const bookedSet = new Set(bookedProfessorNames);
    const availableNames = relevantTeacherNames.filter(
      (name) => !bookedSet.has(name),
    );

    availableNames.sort((a, b) => a.localeCompare(b));

    const availableProfessors: ProfessorInfo[] = availableNames.map((name) => ({
      name,
    }));

    return NextResponse.json({
      checkedAt: nowLuxon.toISO() ?? new Date().toISOString(),
      professors: availableProfessors,
    });
  } catch (error: any) {
    console.error("[API Available Now] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
