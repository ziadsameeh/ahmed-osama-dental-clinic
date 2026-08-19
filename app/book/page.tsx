import type { Metadata } from "next";
import { Suspense } from "react";
import BookingWizard from "@/components/booking/BookingWizard";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description: "Book an appointment with Dr. Ahmed Osama Sameeh at Mokattam, Zayed, Kafr El-Zayat or Tanta.",
};

export default function BookPage() {
  return (
    <section className="mx-auto min-h-[70vh] max-w-3xl px-5 py-14">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-coffee">Book an Appointment</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-espresso sm:text-4xl">
        Let&apos;s find you a time
      </h1>
      <p className="mt-2 text-espresso-soft">No account needed — just a few quick details.</p>

      <div className="mt-10">
        <Suspense fallback={null}>
          <BookingWizard />
        </Suspense>
      </div>
    </section>
  );
}
