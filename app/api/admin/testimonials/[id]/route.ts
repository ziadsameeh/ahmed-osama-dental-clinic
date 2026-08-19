import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const testimonial = await prisma.testimonial.update({ where: { id }, data: body }).catch(() => null);
  if (!testimonial) return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
  return NextResponse.json({ testimonial });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.testimonial.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
