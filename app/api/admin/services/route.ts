import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serviceSchema } from "@/lib/validation";

export async function GET() {
  const services = await prisma.service.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ services });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;
  try {
    const service = await prisma.service.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        price: data.price ?? null,
        estimatedDuration: data.estimatedDuration ?? null,
        isActive: data.isActive ?? true,
      },
    });
    return NextResponse.json({ service }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "A service with that slug already exists." }, { status: 409 });
  }
}
