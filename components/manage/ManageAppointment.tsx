"use client";

import { useEffect, useState, useCallback } from "react";
import Calendar from "@/components/booking/Calendar";
import {
  buildWhatsAppLink,
  CLINIC_WHATSAPP_NUMBER,
} from "@/lib/whatsapp";

type Appointment = {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  patient: {
    fullName: string;
    phone: string;
  };
  location: {
    id: string;
    name: string;
  };
  service: {
    name: string;
  };
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending confirmation",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  NO_SHOW: "No-show",
};

function formatDisplayDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);

  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }
  );
}

export default function ManageAppointment({
  token,
}: {
  token: string;
}) {
  const [appointment, setAppointment] =
    useState<Appointment | null>(null);

  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reschedule, setReschedule] = useState(false);
  const [newDate, setNewDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] =
    useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const load = useCallback(() => {
    setLoading(true);

    fetch(`/api/manage/${token}`)
      .then(async (r) => {
        if (!r.ok) {
          setNotFound(true);
          return;
        }

        const data = await r.json();
        setAppointment(data.appointment);
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => load(), [load]);

  useEffect(() => {
    if (!appointment || !newDate) {
      setSlots([]);
      return;
    }

    setSlotsLoading(true);
    setSlotsMessage(null);

    fetch(
      `/api/availability/slots?locationId=${appointment.location.id}&date=${newDate}`
    )
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots ?? []);

        if (data.message) {
          setSlotsMessage(data.message);
        }
      })
      .finally(() => setSlotsLoading(false));
  }, [appointment, newDate]);

  async function requestNewTime(time: string) {
    if (!newDate) return;

    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/manage/${token}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: newDate,
        time,
      }),
    });

    const data = await res.json().catch(() => ({}));

    setSubmitting(false);

    if (!res.ok) {
      setError(
        data.error ??
          "Something went wrong. Please try again."
      );
      return;
    }

    setAppointment(data.appointment);
    setReschedule(false);
    setNewDate(null);
    setSuccess(true);
  }

  if (loading) {
    return (
      <p className="text-center text-espresso-soft/70">
        Loading your appointment…
      </p>
    );
  }

  if (notFound || !appointment) {
    return (
      <div className="rounded-2xl border border-latte-light bg-warm-white p-8 text-center">
        <p className="font-display text-lg text-espresso">
          We couldn&apos;t find this appointment.
        </p>

        <p className="mt-2 text-sm text-espresso-soft/70">
          The link may be incorrect or the appointment may
          have been removed. Please contact the clinic
          directly.
        </p>
      </div>
    );
  }

  const whatsappHref = buildWhatsAppLink(
    CLINIC_WHATSAPP_NUMBER,
    `Hi, I'm ${appointment.patient.fullName}. I have a question about my appointment (${appointment.service.name} at ${appointment.location.name}, ${formatDisplayDate(appointment.appointmentDate)} ${appointment.appointmentTime}).`
  );

  const locked =
    appointment.status === "CANCELLED" ||
    appointment.status === "COMPLETED";

  return (
    <div className="rounded-2xl border border-latte-light bg-warm-white p-6 sm:p-8">
      {success && (
        <p className="mb-5 rounded-xl bg-sage-light px-4 py-3 text-sm text-sage">
          Your new time was requested — the clinic will
          confirm it shortly.
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-xl font-semibold text-espresso">
          Your appointment
        </h1>

        <span className="rounded-full bg-cream-dark px-3 py-1 text-xs font-medium text-espresso">
          {STATUS_LABEL[appointment.status] ??
            appointment.status}
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-espresso-soft/60">
            Patient
          </dt>

          <dd className="font-medium text-espresso">
            {appointment.patient.fullName}
          </dd>
        </div>

        <div>
          <dt className="text-espresso-soft/60">
            Service
          </dt>

          <dd className="font-medium text-espresso">
            {appointment.service.name}
          </dd>
        </div>

        <div>
          <dt className="text-espresso-soft/60">
            Location
          </dt>

          <dd className="font-medium text-espresso">
            {appointment.location.name}
          </dd>
        </div>

        <div>
          <dt className="text-espresso-soft/60">
            Date &amp; time
          </dt>

          <dd className="font-medium text-espresso">
            {formatDisplayDate(
              appointment.appointmentDate
            )}{" "}
            — {appointment.appointmentTime}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-latte-light px-4 py-2 text-sm font-medium text-espresso transition hover:border-coffee"
        >
          Message us on WhatsApp
        </a>

        {!locked && !reschedule && (
          <button
            type="button"
            onClick={() => setReschedule(true)}
            className="rounded-full bg-espresso px-4 py-2 text-sm font-medium text-warm-white transition hover:bg-coffee-dark"
          >
            Request a different date &amp; time
          </button>
        )}
      </div>

      {locked && (
        <p className="mt-4 text-sm text-espresso-soft/60">
          This appointment is{" "}
          {STATUS_LABEL[
            appointment.status
          ]?.toLowerCase()}{" "}
          and can no longer be changed here — please
          contact the clinic if you need help.
        </p>
      )}

      {reschedule && (
        <div className="mt-6 border-t border-latte-light pt-6">
          <p className="mb-3 text-sm font-medium text-espresso">
            Choose a new date
          </p>

          <Calendar
            locationId={appointment.location.id}
            selectedDate={newDate}
            onSelect={setNewDate}
          />

          {newDate && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-espresso">
                Choose a new time
              </p>

              {slotsLoading && (
                <p className="text-sm text-espresso-soft/60">
                  Loading available times…
                </p>
              )}

              {!slotsLoading && slotsMessage && (
                <p className="text-sm text-espresso-soft/60">
                  {slotsMessage}
                </p>
              )}

              {!slotsLoading &&
                !slotsMessage &&
                slots.length === 0 && (
                  <p className="text-sm text-espresso-soft/60">
                    No times available on this date.
                  </p>
                )}

              <div className="flex flex-wrap gap-2">
                {slots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    disabled={submitting}
                    onClick={() =>
                      requestNewTime(time)
                    }
                    className="rounded-full border border-latte-light bg-cream px-3 py-1.5 text-sm text-espresso transition hover:border-coffee disabled:opacity-50"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setReschedule(false);
              setNewDate(null);
            }}
            className="mt-4 text-sm text-espresso-soft/60 hover:text-espresso"
          >
            Cancel
          </button>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}