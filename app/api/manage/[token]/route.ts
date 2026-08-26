import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rescheduleSchema } from "@/lib/validation";
import { getAvailableSlots, isDateAvailableForLocation, parseDateKey } from "@/lib/availability";
import { sendAdminRescheduleNotification, sendPatientRescheduleReceived } from "@/lib/email";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { manageToken: token },
    include: { patient: true, location: true, service: true },
  });
  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }
  return NextResponse.json({ appointment });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { manageToken: token },
    include: { patient: true, location: true, service: true },
  });
  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }
  if (appointment.status === "CANCELLED" || appointment.status === "COMPLETED") {
    return NextResponse.json({ error: "This appointment can no longer be changed." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = rescheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please choose a valid date and time." }, { status: 400 });
  }

  const date = parseDateKey(parsed.data.date);
  const dayOpen = await isDateAvailableForLocation(appointment.locationId, date);
  if (!dayOpen) {
    const weekdayName = date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
    return NextResponse.json(
      { error: `No appointments available for this location on ${weekdayName}.` },
      { status: 400 }
    );
  }

  const slots = await getAvailableSlots(appointment.locationId, date);
  if (!slots.includes(parsed.data.time)) {
    return NextResponse.json(
      { error: "Sorry, this time is no longer available. Please choose another." },
      { status: 409 }
    );
  }

  const updated = await prisma.appointment
    .update({
      where: { id: appointment.id },
      data: { appointmentDate: date, appointmentTime: parsed.data.time, status: "PENDING" },
      include: { patient: true, location: true, service: true },
    })
    .catch(() => null);

  if (!updated) {
    return NextResponse.json(
      { error: "Sorry, this time is no longer available. Please choose another." },
      { status: 409 }
    );
  }

  const emailPayload = {
    id: updated.id,
    appointmentDate: parsed.data.date,
    appointmentTime: updated.appointmentTime,
    manageToken: updated.manageToken,
    patient: updated.patient,
    location: updated.location,
    service: updated.service,
  };

  await Promise.all([
    sendPatientRescheduleReceived(emailPayload),
    sendAdminRescheduleNotification(emailPayload),
  ]);

  return NextResponse.json({ appointment: updated });
}