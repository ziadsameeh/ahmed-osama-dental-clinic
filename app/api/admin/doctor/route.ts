import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const existing = await prisma.doctor.findFirst();
  const doctor = existing
    ? await prisma.doctor.update({ where: { id: existing.id }, data: body })
    : await prisma.doctor.create({ data: body });

  return NextResponse.json({ doctor });
}
