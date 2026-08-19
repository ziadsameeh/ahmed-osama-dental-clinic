"use client";

import { useEffect, useState, useCallback } from "react";

const WEEKDAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

type Location = {
  id: string;
  name: string;
  clinicName: string | null;
  address: string | null;
  phone: string | null;
  mapsUrl: string | null;
  isActive: boolean;
  weeklyAvailability: { weekday: number; isAvailable: boolean }[];
  workingHours: { openTime: string; closeTime: string; breakStart: string | null; breakEnd: string | null; slotMinutes: number } | null;
  blockedDates: { id: string; date: string; reason: string | null }[];
};

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/locations")
      .then((r) => r.json())
      .then((data) => setLocations(data.locations ?? []))
      .finally(() => setLoading(false));
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
  useEffect(() => load(), [load]);

  async function saveLocation(loc: Location, weekly: { weekday: number; isAvailable: boolean }[]) {
    setSavingId(loc.id);
    setMessage(null);
    const res = await fetch(`/api/admin/locations/${loc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        details: {
          name: loc.name,
          clinicName: loc.clinicName,
          address: loc.address,
          phone: loc.phone,
          mapsUrl: loc.mapsUrl,
          isActive: loc.isActive,
        },
        weeklySchedule: weekly,
        workingHours: loc.workingHours
          ? {
              openTime: loc.workingHours.openTime,
              closeTime: loc.workingHours.closeTime,
              breakStart: loc.workingHours.breakStart || null,
              breakEnd: loc.workingHours.breakEnd || null,
              slotMinutes: Number(loc.workingHours.slotMinutes),
            }
          : undefined,
      }),
    });
    setSavingId(null);
    if (res.ok) {
      setMessage(`${loc.name} saved.`);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error ?? "Failed to save.");
    }
  }

  function updateLocal(id: string, patch: Partial<Location>) {
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function toggleWeekday(loc: Location, weekday: number) {
    const existing = loc.weeklyAvailability.find((w) => w.weekday === weekday);
    const next = loc.weeklyAvailability.some((w) => w.weekday === weekday)
      ? loc.weeklyAvailability.map((w) => (w.weekday === weekday ? { ...w, isAvailable: !w.isAvailable } : w))
      : [...loc.weeklyAvailability, { weekday, isAvailable: true }];
    updateLocal(loc.id, { weeklyAvailability: next });
    void existing;
  }

  if (loading) return <p className="text-espresso-soft/70">Loading locations…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-espresso">Locations &amp; Schedule</h1>
      <p className="mt-1 text-sm text-espresso-soft/70">
        Manage each clinic&rsquo;s details, weekly availability and working hours. Changes save per clinic.
      </p>
      {message && <p className="mt-3 rounded-lg bg-latte-light px-3 py-2 text-sm text-espresso">{message}</p>}

      <div className="mt-6 grid gap-6">
        {locations.map((loc) => (
          <div key={loc.id} className="rounded-2xl border border-latte-light bg-warm-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold">{loc.name}</h2>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={loc.isActive}
                  onChange={(e) => updateLocal(loc.id, { isActive: e.target.checked })}
                />
                Active
              </label>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Clinic name
                <input
                  className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
                  value={loc.clinicName ?? ""}
                  onChange={(e) => updateLocal(loc.id, { clinicName: e.target.value })}
                />
              </label>
              <label className="text-sm">
                Phone
                <input
                  className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
                  value={loc.phone ?? ""}
                  onChange={(e) => updateLocal(loc.id, { phone: e.target.value })}
                />
              </label>
              <label className="text-sm sm:col-span-2">
                Address
                <input
                  className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
                  value={loc.address ?? ""}
                  onChange={(e) => updateLocal(loc.id, { address: e.target.value })}
                />
              </label>
              <label className="text-sm sm:col-span-2">
                Google Maps link
                <input
                  className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
                  value={loc.mapsUrl ?? ""}
                  onChange={(e) => updateLocal(loc.id, { mapsUrl: e.target.value })}
                />
              </label>
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium text-espresso">Weekly availability</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => {
                  const entry = loc.weeklyAvailability.find((w) => w.weekday === day.value);
                  const isOn = entry?.isAvailable ?? false;
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleWeekday(loc, day.value)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        isOn
                          ? "border-coffee bg-coffee text-warm-white"
                          : "border-latte-light bg-cream text-espresso-soft/70"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {loc.workingHours && (
              <div className="mt-5 grid gap-3 sm:grid-cols-5">
                <label className="text-sm">
                  Open
                  <input
                    type="time"
                    className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
                    value={loc.workingHours.openTime}
                    onChange={(e) => updateLocal(loc.id, { workingHours: { ...loc.workingHours!, openTime: e.target.value } })}
                  />
                </label>
                <label className="text-sm">
                  Close
                  <input
                    type="time"
                    className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
                    value={loc.workingHours.closeTime}
                    onChange={(e) => updateLocal(loc.id, { workingHours: { ...loc.workingHours!, closeTime: e.target.value } })}
                  />
                </label>
                <label className="text-sm">
                  Break start
                  <input
                    type="time"
                    className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
                    value={loc.workingHours.breakStart ?? ""}
                    onChange={(e) => updateLocal(loc.id, { workingHours: { ...loc.workingHours!, breakStart: e.target.value } })}
                  />
                </label>
                <label className="text-sm">
                  Break end
                  <input
                    type="time"
                    className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
                    value={loc.workingHours.breakEnd ?? ""}
                    onChange={(e) => updateLocal(loc.id, { workingHours: { ...loc.workingHours!, breakEnd: e.target.value } })}
                  />
                </label>
                <label className="text-sm">
                  Slot (min)
                  <input
                    type="number"
                    min={5}
                    max={180}
                    className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
                    value={loc.workingHours.slotMinutes}
                    onChange={(e) => updateLocal(loc.id, { workingHours: { ...loc.workingHours!, slotMinutes: Number(e.target.value) } })}
                  />
                </label>
              </div>
            )}

            <button
              type="button"
              disabled={savingId === loc.id}
              onClick={() => saveLocation(loc, loc.weeklyAvailability)}
              className="mt-5 rounded-full bg-espresso px-5 py-2 text-sm font-medium text-warm-white transition hover:bg-coffee-dark disabled:opacity-60"
            >
              {savingId === loc.id ? "Saving…" : "Save changes"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
