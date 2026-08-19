import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseDateKey } from "@/lib/availability";
import type { Prisma, AppointmentStatus } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");
  const serviceId = searchParams.get("serviceId");
  const status = searchParams.get("status") as AppointmentStatus | null;
  const date = searchParams.get("date");
  const search = searchParams.get("search");

  const where: Prisma.AppointmentWhereInput = {};
  if (locationId) where.locationId = locationId;
  if (serviceId) where.serviceId = serviceId;
  if (status) where.status = status;
  if (date) where.appointmentDate = parseDateKey(date);
  if (search) {
    where.patient = {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ],
    };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: { patient: true, location: true, service: true },
    orderBy: [{ appointmentDate: "desc" }, { appointmentTime: "asc" }],
    take: 200,
  });

  return NextResponse.json({ appointments });
}
