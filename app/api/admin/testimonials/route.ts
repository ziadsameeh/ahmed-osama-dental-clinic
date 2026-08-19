import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ testimonials });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.patientName || !body?.content) {
    return NextResponse.json({ error: "Patient name and content are required." }, { status: 400 });
  }
  const testimonial = await prisma.testimonial.create({
    data: {
      patientName: body.patientName,
      content: body.content,
      rating: body.rating ?? null,
      isPublished: body.isPublished ?? false,
    },
  });
  return NextResponse.json({ testimonial }, { status: 201 });
}
