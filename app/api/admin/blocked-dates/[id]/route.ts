import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.blockedDate.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
