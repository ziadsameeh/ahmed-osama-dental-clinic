import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { workingHourSchema } from "@/lib/validation";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const location = await prisma.location.findUnique({ where: { id } });
  if (!location) return NextResponse.json({ error: "Location not found" }, { status: 404 });

  // 1) Basic details
  if (body.details) {
    const { name, clinicName, address, phone, mapsUrl, isActive } = body.details;
    await prisma.location.update({
      where: { id },
      data: { name, clinicName, address, phone, mapsUrl, isActive },
    });
  }

  // 2) Weekly schedule: array of { weekday, isAvailable }
  if (Array.isArray(body.weeklySchedule)) {
    await prisma.$transaction(
      body.weeklySchedule.map((entry: { weekday: number; isAvailable: boolean }) =>
        prisma.weeklyAvailability.upsert({
          where: { locationId_weekday: { locationId: id, weekday: entry.weekday } },
          update: { isAvailable: entry.isAvailable },
          create: { locationId: id, weekday: entry.weekday, isAvailable: entry.isAvailable },
        })
      )
    );
  }

  // 3) Working hours
  if (body.workingHours) {
    const parsed = workingHourSchema.safeParse(body.workingHours);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid working hours" }, { status: 400 });
    }
    const wh = parsed.data;
    await prisma.workingHour.upsert({
      where: { locationId: id },
      update: {
        openTime: wh.openTime,
        closeTime: wh.closeTime,
        breakStart: wh.breakStart || null,
        breakEnd: wh.breakEnd || null,
        slotMinutes: wh.slotMinutes,
      },
      create: {
        locationId: id,
        openTime: wh.openTime,
        closeTime: wh.closeTime,
        breakStart: wh.breakStart || null,
        breakEnd: wh.breakEnd || null,
        slotMinutes: wh.slotMinutes,
      },
    });
  }

  const updated = await prisma.location.findUnique({
    where: { id },
    include: { weeklyAvailability: true, workingHours: true, blockedDates: true },
  });

  return NextResponse.json({ location: updated });
}
