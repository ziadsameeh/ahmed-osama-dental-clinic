"use client";

import { useEffect, useState, useCallback } from "react";

type Appointment = {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  notes: string | null;
  patient: { fullName: string; age: number; gender: string; phone: string; email: string | null };
  location: { id: string; name: string };
  service: { id: string; name: string };
};

const STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (date) params.set("date", date);
    fetch(`/api/admin/appointments?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setAppointments(data.appointments ?? []))
      .finally(() => setLoading(false));
  }, [search, status, date]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function updateStatus(id: string, newStatus: string) {
    setActionError(null);
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setActionError(data.error ?? "Failed to update status.");
      return;
    }
    load();
  }

  async function submitReschedule(id: string) {
    setActionError(null);
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: rescheduleDate, time: rescheduleTime }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionError(data.error ?? "Failed to reschedule.");
      return;
    }
    setRescheduleId(null);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-espresso">Appointments</h1>

      <div className="mt-5 flex flex-wrap gap-3">
        <input
          placeholder="Search name or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-latte-light bg-warm-white px-4 py-2.5 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-latte-light bg-warm-white px-4 py-2.5 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border border-latte-light bg-warm-white px-4 py-2.5 text-sm"
        />
      </div>

      {actionError && <p className="mt-4 rounded-xl bg-error/10 p-3 text-sm text-error">{actionError}</p>}

      <div className="mt-5 overflow-x-auto rounded-2xl border border-latte-light bg-warm-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-latte-light text-left text-xs uppercase text-espresso-soft/60">
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Date / Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-b border-latte-light/60 align-top last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-espresso">{a.patient.fullName}</p>
                  <p className="text-xs text-espresso-soft/70">{a.patient.age} · {a.patient.gender}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{a.patient.phone}</p>
                  {a.patient.email && <p className="text-xs text-espresso-soft/70">{a.patient.email}</p>}
                </td>
                <td className="px-4 py-3">{a.location.name}</td>
                <td className="px-4 py-3">{a.service.name}</td>
                <td className="px-4 py-3">
                  {rescheduleId === a.id ? (
                    <div className="flex flex-col gap-1.5">
                      <input
                        type="date"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="rounded-lg border border-latte-light px-2 py-1 text-xs"
                      />
                      <input
                        type="time"
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className="rounded-lg border border-latte-light px-2 py-1 text-xs"
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => submitReschedule(a.id)}
                          className="rounded-lg bg-coffee px-2 py-1 text-xs font-medium text-warm-white"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setRescheduleId(null)}
                          className="rounded-lg border border-latte-light px-2 py-1 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {a.appointmentDate.slice(0, 10)} {a.appointmentTime}
                    </>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-cream-dark px-2.5 py-1 text-xs font-medium">{a.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <select
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value)}
                      className="rounded-lg border border-latte-light px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        setRescheduleId(a.id);
                        setRescheduleDate(a.appointmentDate.slice(0, 10));
                        setRescheduleTime(a.appointmentTime);
                      }}
                      className="rounded-lg border border-latte-light px-2 py-1 text-xs"
                    >
                      Reschedule
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && appointments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-espresso-soft">
                  No appointments match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
