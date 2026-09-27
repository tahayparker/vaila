import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DateTime } from "luxon";

export const dynamic = "force-dynamic";

const DUBAI_TIMEZONE = "Asia/Dubai";

interface ProfessorInfo {
  name: string;
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Default body
    }

    const { durationMinutes = 30 } = body;
    if (typeof durationMinutes !== "number" || durationMinutes < 0) {
      return NextResponse.json(
        { error: "Invalid durationMinutes parameter." },
        { status: 400 },
      );
    }

    const nowLuxon = DateTime.now().setZone(DUBAI_TIMEZONE);
    const futureTimeLuxon = nowLuxon.plus({ minutes: durationMinutes });
    const checkDayDubai = futureTimeLuxon.toFormat("EEEE");
    const checkTimeDubai = futureTimeLuxon.toFormat("HH:mm");

    if (!checkDayDubai) {
      return NextResponse.json(
        { error: "Internal server error: Cannot determine check day." },
        { status: 500 },
      );
    }

    // 1. Get ALL distinct teacher names from Timings
    const relevantTimings = await prisma.timings.findMany({
      select: { Teacher: true },
      distinct: ["Teacher"],
    });
    const relevantTeacherNames = relevantTimings.map((t) => t.Teacher);

    // 2. Find distinct teachers BOOKED at the FUTURE time
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

    // 3. Calculate Available Teachers
    const occupiedSet = new Set(occupiedProfessorNames);
    const availableNames = relevantTeacherNames.filter(
      (name) => !occupiedSet.has(name),
    );

    availableNames.sort((a, b) => a.localeCompare(b));

    const availableProfessors: ProfessorInfo[] = availableNames.map((name) => ({
      name,
    }));

    return NextResponse.json({
      checkedAtFutureTime: futureTimeLuxon.toISO() ?? new Date().toISOString(),
      professors: availableProfessors,
    });
  } catch (error: any) {
    console.error("[API Available Soon] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
