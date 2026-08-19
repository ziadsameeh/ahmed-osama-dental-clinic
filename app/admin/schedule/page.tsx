"use client";

import { useEffect, useState, useCallback } from "react";

type Location = { id: string; name: string };
type BlockedDate = { id: string; date: string; reason: string | null; location: { name: string } | null };

export default function AdminSchedulePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [blocked, setBlocked] = useState<BlockedDate[]>([]);
  const [locationId, setLocationId] = useState<string>("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/locations").then((r) => r.json()),
      fetch("/api/admin/blocked-dates").then((r) => r.json()),
    ])
      .then(([locData, blockedData]) => {
        setLocations(locData.locations ?? []);
        setBlocked(blockedData.blockedDates ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
  useEffect(() => load(), [load]);

  async function addBlockedDate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/blocked-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId: locationId || null, date, reason }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to block date.");
      return;
    }
    setDate("");
    setReason("");
    load();
  }

  async function removeBlockedDate(id: string) {
    await fetch(`/api/admin/blocked-dates/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-espresso">Blocked Dates</h1>
      <p className="mt-1 text-sm text-espresso-soft/70">
        Block holidays, vacation days, or emergency closures. Leave &ldquo;Location&rdquo; empty to block a date across every clinic.
        Weekly open/closed days per clinic are managed on the Locations page.
      </p>

      <form onSubmit={addBlockedDate} className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-latte-light bg-warm-white p-5">
        <label className="text-sm">
          Location (optional)
          <select
            className="mt-1 block w-48 rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            <option value="">All locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Date
          <input
            type="date"
            required
            className="mt-1 block rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="text-sm flex-1 min-w-[180px]">
          Reason (optional)
          <input
            className="mt-1 block w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            placeholder="e.g. Public holiday"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <button type="submit" className="rounded-full bg-espresso px-5 py-2 text-sm font-medium text-warm-white hover:bg-coffee-dark">
          Block date
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-error">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-latte-light bg-warm-white">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-latte-light text-left text-xs uppercase text-espresso-soft/60">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {!loading && blocked.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-espresso-soft/60">
                  No blocked dates yet.
                </td>
              </tr>
            )}
            {blocked.map((b) => (
              <tr key={b.id} className="border-b border-latte-light/60 last:border-0">
                <td className="px-4 py-3">{b.date.slice(0, 10)}</td>
                <td className="px-4 py-3">{b.location?.name ?? "All locations"}</td>
                <td className="px-4 py-3">{b.reason ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => removeBlockedDate(b.id)} className="text-xs font-medium text-error hover:underline">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
