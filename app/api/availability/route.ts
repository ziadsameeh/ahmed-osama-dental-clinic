import { NextResponse } from "next/server";
import { getAvailableSlots, isDateAvailableForLocation, toDateKey } from "@/lib/availability";

// GET /api/availability?locationId=xxx&year=2026&month=8  (month is 1-12)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));

  if (!locationId || !year || !month) {
    return NextResponse.json({ error: "locationId, year and month are required" }, { status: 400 });
  }

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const availableDates: string[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(Date.UTC(year, month - 1, day));
    const openDay = await isDateAvailableForLocation(locationId, date);
    if (!openDay) continue;
    // Only mark as available if at least one time slot remains open.
    const slots = await getAvailableSlots(locationId, date);
    if (slots.length > 0) availableDates.push(toDateKey(date));
  }

  return NextResponse.json({ availableDates });
}
