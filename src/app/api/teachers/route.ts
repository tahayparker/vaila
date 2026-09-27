import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface TeacherListData {
  name: string;
  email: string | null;
  phone: string | null;
}

const FILTER_KEYWORDS_MASTER = [
  "instructor",
  "adjunct",
  "tba",
  "new ",
  " ps",
  "unknown",
  "staff",
];

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      select: {
        Name: true,
        Email: true,
        Phone: true,
      },
      where: {
        NOT: {
          OR: FILTER_KEYWORDS_MASTER.map((keyword) => ({
            Name: { contains: keyword, mode: "insensitive" },
          })),
        },
      },
      orderBy: {
        Name: "asc",
      },
    });

    const responseData: TeacherListData[] = teachers.map((teacher) => ({
      name: teacher.Name,
      email: teacher.Email ?? null,
      phone: teacher.Phone ?? null,
    }));

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("[API Teachers - Master List] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
