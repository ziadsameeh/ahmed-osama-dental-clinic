import Link from "next/link";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Location = {
  id: string;
  name: string;
  clinicName: string | null;
  weeklyAvailability: { weekday: number; isAvailable: boolean }[];
};

export default function Locations({ locations }: { locations: Location[] }) {
  return (
    <section id="locations" className="bg-cream-dark/40 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-coffee">Locations</p>
        <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold text-espresso sm:text-4xl">
          Four clinics, one doctor
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {locations.map((location) => {
            const byWeekday = new Map(location.weeklyAvailability.map((w) => [w.weekday, w.isAvailable]));
            return (
              <div key={location.id} className="rounded-2xl border border-latte-light bg-warm-white p-6">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-xl font-semibold text-espresso">{location.name}</h3>
                  {location.clinicName && location.clinicName !== "[TO BE PROVIDED]" && (
                    <span className="text-xs text-espresso-soft/70">{location.clinicName}</span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-7 gap-1.5">
                  {WEEKDAY_LABELS.map((label, weekday) => {
                    const available = byWeekday.get(weekday) ?? false;
                    return (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-medium uppercase text-espresso-soft/60">
                          {label}
                        </span>
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                            available
                              ? "bg-sage-light text-sage"
                              : "bg-cream-dark text-espresso-soft/40 line-through"
                          }`}
                          aria-label={available ? `${label} available` : `${label} unavailable`}
                        >
                          {available ? "✓" : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Link
                  href={`/book?location=${location.id}`}
                  className="mt-5 inline-block text-sm font-semibold text-coffee hover:text-coffee-dark"
                >
                  Book at {location.name} →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
