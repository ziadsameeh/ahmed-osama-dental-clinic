import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const faqs = await prisma.fAQ.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ faqs });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.question || !body?.answer) {
    return NextResponse.json({ error: "Question and answer are required." }, { status: 400 });
  }
  const faq = await prisma.fAQ.create({
    data: { question: body.question, answer: body.answer, sortOrder: body.sortOrder ?? 0 },
  });
  return NextResponse.json({ faq }, { status: 201 });
}
