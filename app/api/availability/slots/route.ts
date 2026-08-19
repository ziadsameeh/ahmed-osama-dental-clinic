import { NextResponse } from "next/server";
import { getAvailableSlots, isDateAvailableForLocation, parseDateKey } from "@/lib/availability";
import { prisma } from "@/lib/prisma";

// GET /api/availability/slots?locationId=xxx&date=2026-08-25
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");
  const dateStr = searchParams.get("date");

  if (!locationId || !dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json({ error: "locationId and date (YYYY-MM-DD) are required" }, { status: 400 });
  }

  const location = await prisma.location.findUnique({ where: { id: locationId } });
  if (!location || !location.isActive) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const date = parseDateKey(dateStr);
  const openDay = await isDateAvailableForLocation(locationId, date);
  if (!openDay) {
    const weekdayName = date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
    return NextResponse.json({
      slots: [],
      message: `No appointments available for this location on ${weekdayName}.`,
    });
  }

  const slots = await getAvailableSlots(locationId, date);
  return NextResponse.json({ slots });
}
