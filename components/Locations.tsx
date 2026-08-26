import Link from "next/link";
import {
  FacebookIcon,
  InstagramIcon,
} from "@/components/icons/SocialIcons";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CLINIC_SOCIALS: Record<
  string,
  { facebook?: string; instagram?: string }
> = {
  "kafr-el-zayat": {
    facebook: "https://www.facebook.com/share/1BdjWbfja1/?mibextid=wwXIfr",
    instagram:
      "https://www.instagram.com/masters.dental.clinic?igsh=MWllazlnYWhpYzZ1cA==",
  },
};

type Location = {
  id: string;
  slug: string;
  name: string;
  clinicName: string | null;
  weeklyAvailability: {
    weekday: number;
    isAvailable: boolean;
  }[];
};

export default function Locations({
  locations,
}: {
  locations: Location[];
}) {
  return (
    <section id="locations" className="bg-cream-dark/40 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-coffee">
          Locations
        </p>

        <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold text-espresso sm:text-4xl">
          Four clinics, one doctor
        </h2>

        <div className="mt-10 grid items-start gap-5 sm:grid-cols-2">
          {locations.map((location) => {
            const byWeekday = new Map(
              location.weeklyAvailability.map((w) => [
                w.weekday,
                w.isAvailable,
              ])
            );

            const socials = CLINIC_SOCIALS[location.slug];

            return (
              <div
                key={location.id}
                className="rounded-2xl border border-latte-light bg-warm-white p-6"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-xl font-semibold text-espresso">
                    {location.name}
                  </h3>

                  {location.clinicName &&
                    location.clinicName !== "[TO BE PROVIDED]" && (
                      <span className="text-xs text-espresso-soft/70">
                        {location.clinicName}
                      </span>
                    )}
                </div>

                <div className="mt-4 grid grid-cols-7 gap-1.5">
                  {WEEKDAY_LABELS.map((label, weekday) => {
                    const available =
                      byWeekday.get(weekday) ?? false;

                    return (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-1"
                      >
                        <span className="text-[10px] font-medium uppercase text-espresso-soft/60">
                          {label}
                        </span>

                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                            available
                              ? "bg-sage-light text-sage"
                              : "bg-cream-dark text-espresso-soft/40 line-through"
                          }`}
                          aria-label={
                            available
                              ? `${label} available`
                              : `${label} unavailable`
                          }
                        >
                          {available ? "✓" : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {socials && (
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-latte-light/60 pt-4">
                    <span className="text-xs font-medium uppercase tracking-wide text-espresso-soft/50">
                      Follow Masters Dental Clinic
                    </span>

                    <div className="flex items-center gap-2">
                      {socials.facebook && (
                        <a
                          href={socials.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${location.name} on Facebook`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-latte-light text-espresso-soft/70 transition hover:border-coffee hover:text-coffee"
                        >
                          <FacebookIcon size={14} />
                        </a>
                      )}

                      {socials.instagram && (
                        <a
                          href={socials.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${location.name} on Instagram`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-latte-light text-espresso-soft/70 transition hover:border-coffee hover:text-coffee"
                        >
                          <InstagramIcon size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-5">
                  <Link
                    href={`/book?location=${location.id}`}
                    className="text-sm font-semibold text-coffee hover:text-coffee-dark"
                  >
                    Book at {location.name} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}