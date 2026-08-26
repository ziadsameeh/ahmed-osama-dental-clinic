import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { appointmentStatusSchema, rescheduleSchema } from "@/lib/validation";
import { getAvailableSlots, isDateAvailableForLocation, parseDateKey } from "@/lib/availability";
import { sendPatientAppointmentConfirmed, sendAdminAppointmentConfirmed } from "@/lib/email";

function toEmailPayload(appt: {
  id: string;
  appointmentDate: Date;
  appointmentTime: string;
  manageToken: string;
  patient: { fullName: string; phone: string; email: string | null };
  location: { name: string };
  service: { name: string };
}) {
  return {
    id: appt.id,
    appointmentDate: appt.appointmentDate.toISOString().slice(0, 10),
    appointmentTime: appt.appointmentTime,
    manageToken: appt.manageToken,
    patient: appt.patient,
    location: appt.location,
    service: appt.service,
  };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  if (body.date && body.time) {
    const parsed = rescheduleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
    }

    const date = parseDateKey(parsed.data.date);
    const dayOpen = await isDateAvailableForLocation(appointment.locationId, date);

    if (!dayOpen) {
      return NextResponse.json(
        { error: "That date is not available for this location." },
        { status: 400 }
      );
    }

    const slots = await getAvailableSlots(appointment.locationId, date);

    if (!slots.includes(parsed.data.time)) {
      return NextResponse.json(
        { error: "That time slot is not available." },
        { status: 409 }
      );
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        appointmentDate: date,
        appointmentTime: parsed.data.time,
        status: "CONFIRMED",
      },
      include: { patient: true, location: true, service: true },
    });

    await sendPatientAppointmentConfirmed(toEmailPayload(updated));
    await sendAdminAppointmentConfirmed(toEmailPayload(updated));

    return NextResponse.json({ appointment: updated });
  }

  const parsedStatus = appointmentStatusSchema.safeParse(body);

  if (!parsedStatus.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: parsedStatus.data.status },
    include: { patient: true, location: true, service: true },
  });

  if (parsedStatus.data.status === "CONFIRMED") {
    await sendPatientAppointmentConfirmed(toEmailPayload(updated));
    await sendAdminAppointmentConfirmed(toEmailPayload(updated));
  }

  return NextResponse.json({ appointment: updated });
}