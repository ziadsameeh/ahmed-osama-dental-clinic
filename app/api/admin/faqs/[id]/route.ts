import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const faq = await prisma.fAQ.update({ where: { id }, data: body }).catch(() => null);
  if (!faq) return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
  return NextResponse.json({ faq });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.fAQ.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
