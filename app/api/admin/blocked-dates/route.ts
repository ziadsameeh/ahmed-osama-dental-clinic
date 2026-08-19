import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blockedDateSchema } from "@/lib/validation";
import { parseDateKey } from "@/lib/availability";

export async function GET() {
  const blockedDates = await prisma.blockedDate.findMany({
    include: { location: true },
    orderBy: { date: "asc" },
  });
  return NextResponse.json({ blockedDates });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = blockedDateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;
  try {
    const blocked = await prisma.blockedDate.create({
      data: {
        locationId: data.locationId || null,
        date: parseDateKey(data.date),
        reason: data.reason || null,
      },
    });
    return NextResponse.json({ blockedDate: blocked }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "That date is already blocked for this location." }, { status: 409 });
  }
}
