"use client";

import { useEffect, useState } from "react";

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function Calendar({
  locationId,
  selectedDate,
  onSelect,
}: {
  locationId: string;
  selectedDate: string | null;
  onSelect: (date: string) => void;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-12
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-month-change
    setLoading(true);
    fetch(`/api/availability?locationId=${locationId}&year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setAvailableDates(new Set(data.availableDates ?? []));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [locationId, year, month]);

  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const startWeekday = firstOfMonth.getUTCDay(); // 0=Sun
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const todayKey = toKey(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function goPrevMonth() {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }
  function goNextMonth() {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const monthLabel = firstOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const isPastMonth =
    year < today.getFullYear() || (year === today.getFullYear() && month <= today.getMonth() + 1 - 1);

  return (
    <div className="rounded-2xl border border-latte-light bg-warm-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevMonth}
          disabled={year === today.getFullYear() && month === today.getMonth() + 1}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-espresso-soft hover:bg-cream disabled:opacity-30"
          aria-label="Previous month"
        >
          ←
        </button>
        <p className="font-display text-base font-semibold text-espresso">{monthLabel}</p>
        <button
          type="button"
          onClick={goNextMonth}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-espresso-soft hover:bg-cream"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-espresso-soft/60">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const key = toKey(year, month, day);
          const isPast = key < todayKey;
          const isAvailable = !isPast && availableDates.has(key);
          const isSelected = key === selectedDate;
          return (
            <button
              key={key}
              type="button"
              disabled={!isAvailable || loading}
              onClick={() => onSelect(key)}
              aria-pressed={isSelected}
              className={[
                "flex h-10 w-full items-center justify-center rounded-lg text-sm transition",
                isSelected
                  ? "bg-coffee text-warm-white font-semibold"
                  : isAvailable
                  ? "bg-sage-light text-espresso hover:bg-latte-light font-medium"
                  : "text-espresso-soft/30",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>

      {!loading && availableDates.size === 0 && !isPastMonth && (
        <p className="mt-4 text-sm text-espresso-soft">
          No appointments available this month at this location. Try another month.
        </p>
      )}
    </div>
  );
}
