import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const doctor = await prisma.doctor.findFirst();
  return NextResponse.json({ doctor });
}
