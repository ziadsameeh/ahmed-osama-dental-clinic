import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toDateKey, parseDateKey } from "@/lib/availability";

export async function GET() {
  const today = parseDateKey(toDateKey(new Date()));

  const [total, todayCount, pending, confirmed, completed, cancelled, noShow, totalPatients] = await Promise.all([
    prisma.appointment.count(),
    prisma.appointment.count({ where: { appointmentDate: today } }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.appointment.count({ where: { status: "CONFIRMED" } }),
    prisma.appointment.count({ where: { status: "COMPLETED" } }),
    prisma.appointment.count({ where: { status: "CANCELLED" } }),
    prisma.appointment.count({ where: { status: "NO_SHOW" } }),
    prisma.patient.count(),
  ]);

  const upcoming = await prisma.appointment.count({
    where: { appointmentDate: { gte: today }, status: { in: ["PENDING", "CONFIRMED"] } },
  });

  return NextResponse.json({
    total,
    today: todayCount,
    upcoming,
    pending,
    confirmed,
    completed,
    cancelled,
    noShow,
    totalPatients,
  });
}
