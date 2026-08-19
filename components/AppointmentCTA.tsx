import Link from "next/link";

export default function AppointmentCTA() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-coffee px-8 py-12 sm:flex-row sm:items-center sm:px-12">
        <div>
          <h2 className="font-display text-2xl font-semibold text-warm-white sm:text-3xl">
            Ready to book your visit?
          </h2>
          <p className="mt-2 max-w-md text-sm text-cream/80">
            Pick your clinic, service and a time that works for you — takes less than two minutes.
          </p>
        </div>
        <Link
          href="/book"
          className="shrink-0 rounded-full bg-latte px-7 py-3.5 text-sm font-semibold text-espresso transition hover:bg-latte-light"
        >
          Book an Appointment
        </Link>
      </div>
    </section>
  );
}
