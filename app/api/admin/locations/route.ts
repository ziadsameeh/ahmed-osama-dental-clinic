import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const locations = await prisma.location.findMany({
    include: {
      weeklyAvailability: { orderBy: { weekday: "asc" } },
      workingHours: true,
      blockedDates: { orderBy: { date: "asc" } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ locations });
}
