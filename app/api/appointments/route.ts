import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { bookAppointmentSchema } from "@/lib/validation";
import { getAvailableSlots, isDateAvailableForLocation, parseDateKey } from "@/lib/availability";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = bookAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid appointment data";
    return NextResponse.json({ error: message, fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const data = parsed.data;
  const date = parseDateKey(data.date);

  // --- Re-validate everything server-side. Never trust the client. ---
  const [location, service] = await Promise.all([
    prisma.location.findUnique({ where: { id: data.locationId } }),
    prisma.service.findUnique({ where: { id: data.serviceId } }),
  ]);

  if (!location || !location.isActive) {
    return NextResponse.json({ error: "The selected location is not available." }, { status: 400 });
  }
  if (!service || !service.isActive) {
    return NextResponse.json({ error: "The selected service is not available." }, { status: 400 });
  }

  const dayOpen = await isDateAvailableForLocation(data.locationId, date);
  if (!dayOpen) {
    const weekdayName = date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
    return NextResponse.json(
      { error: `No appointments available for this location on ${weekdayName}.` },
      { status: 400 }
    );
  }

  const availableSlots = await getAvailableSlots(data.locationId, date);
  if (!availableSlots.includes(data.time)) {
    return NextResponse.json(
      { error: "Sorry, this appointment time is no longer available. Please select another time." },
      { status: 409 }
    );
  }

  try {
    const appointment = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Re-check for a collision *inside* the transaction, then rely on the
      // unique(locationId, appointmentDate, appointmentTime) constraint as
      // the final, database-level guarantee against double booking.
      const clash = await tx.appointment.findFirst({
        where: {
          locationId: data.locationId,
          appointmentDate: date,
          appointmentTime: data.time,
          status: { notIn: ["CANCELLED"] },
        },
      });
      if (clash) {
        throw new Error("SLOT_TAKEN");
      }

      const patient = await tx.patient.create({
        data: {
          fullName: data.fullName,
          age: data.age,
          gender: data.gender,
          phone: data.phone,
          email: data.email || null,
        },
      });

      return tx.appointment.create({
        data: {
          patientId: patient.id,
          locationId: data.locationId,
          serviceId: data.serviceId,
          appointmentDate: date,
          appointmentTime: data.time,
          notes: data.notes || null,
          status: "PENDING",
        },
        include: { location: true, service: true, patient: true },
      });
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "SLOT_TAKEN") {
      return NextResponse.json(
        { error: "Sorry, this appointment time is no longer available. Please select another time." },
        { status: 409 }
      );
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      // Unique constraint on (locationId, appointmentDate, appointmentTime)
      return NextResponse.json(
        { error: "Sorry, this appointment time is no longer available. Please select another time." },
        { status: 409 }
      );
    }
    console.error("Failed to create appointment", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
