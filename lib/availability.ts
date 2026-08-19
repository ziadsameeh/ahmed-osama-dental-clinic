import { prisma } from "@/lib/prisma";

/** Format a Date as YYYY-MM-DD in UTC (matches how we store @db.Date fields). */
export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Build a UTC midnight Date from a YYYY-MM-DD string, avoiding timezone drift. */
export function parseDateKey(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addMinutes(hhmm: string, minutes: number) {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function isBefore(a: string, b: string) {
  return a < b; // "HH:mm" strings compare lexically correctly
}

/**
 * Returns true if the given weekday is enabled for the location's weekly
 * schedule. weekday follows JS convention: 0 = Sunday ... 6 = Saturday.
 */
export async function isWeekdayAvailable(locationId: string, weekday: number) {
  const entry = await prisma.weeklyAvailability.findUnique({
    where: { locationId_weekday: { locationId, weekday } },
  });
  return entry?.isAvailable ?? false;
}

/** Whether a specific calendar date is blocked (location-specific or global). */
export async function isDateBlocked(locationId: string, date: Date) {
  const blocked = await prisma.blockedDate.findFirst({
    where: {
      date,
      OR: [{ locationId }, { locationId: null }],
    },
  });
  return Boolean(blocked);
}

/**
 * Full server-side check for whether a location can accept appointments on
 * a given date at all (weekday open AND not blocked AND not in the past).
 */
export async function isDateAvailableForLocation(locationId: string, date: Date) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (date < today) return false;

  const weekday = date.getUTCDay();
  const weekdayOk = await isWeekdayAvailable(locationId, weekday);
  if (!weekdayOk) return false;

  const blocked = await isDateBlocked(locationId, date);
  if (blocked) return false;

  return true;
}

/** Generate every "HH:mm" slot between working hours, skipping the break window. */
export function generateSlots(opts: {
  openTime: string;
  closeTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
  slotMinutes: number;
}) {
  const { openTime, closeTime, breakStart, breakEnd, slotMinutes } = opts;
  const slots: string[] = [];
  let cursor = openTime;
  while (isBefore(addMinutes(cursor, slotMinutes), closeTime) || addMinutes(cursor, slotMinutes) === closeTime) {
    const inBreak = breakStart && breakEnd && !isBefore(cursor, breakStart) && isBefore(cursor, breakEnd);
    if (!inBreak) slots.push(cursor);
    cursor = addMinutes(cursor, slotMinutes);
  }
  return slots;
}

/**
 * Returns the list of "HH:mm" times still available for booking at a
 * location on a given date, after removing already-booked / past times.
 */
export async function getAvailableSlots(locationId: string, date: Date) {
  const available = await isDateAvailableForLocation(locationId, date);
  if (!available) return [];

  const workingHour = await prisma.workingHour.findUnique({ where: { locationId } });
  if (!workingHour) return [];

  const allSlots = generateSlots({
    openTime: workingHour.openTime,
    closeTime: workingHour.closeTime,
    breakStart: workingHour.breakStart,
    breakEnd: workingHour.breakEnd,
    slotMinutes: workingHour.slotMinutes,
  });

  const existing = await prisma.appointment.findMany({
    where: {
      locationId,
      appointmentDate: date,
      status: { notIn: ["CANCELLED"] },
    },
    select: { appointmentTime: true },
  });
  const taken = new Set(existing.map((a: (typeof existing)[number]) => a.appointmentTime));

  // If the date is today, also drop times that have already passed.
  const now = new Date();
  const isToday = toDateKey(date) === toDateKey(now);
  const nowHHMM = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;

  return allSlots.filter((slot) => !taken.has(slot) && !(isToday && isBefore(slot, nowHHMM)));
}
