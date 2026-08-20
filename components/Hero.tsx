import Image from "next/image";
import Link from "next/link";

export default function Hero({ doctorImage }: { doctorImage: string }) {
  return (
    <section className="relative overflow-hidden bg-espresso">
      <div className="absolute inset-0">
        <Image
          src={doctorImage}
          alt="Dr. Ahmed Osama Sameeh, Orthodontist"
          fill
          priority
          className="object-contain object-top opacity-90"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/70 to-espresso/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/80 via-espresso/30 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-[640px] max-w-6xl flex-col justify-end px-5 pb-16 pt-40 sm:min-h-[720px] sm:pb-24">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-latte">
          Orthodontist
        </p>
        <h1 className="max-w-xl font-display text-4xl font-semibold leading-[1.1] text-warm-white sm:text-6xl">
          Dr. Ahmed Osama Sameeh
        </h1>
        <p className="mt-5 max-w-lg text-base text-cream/85 sm:text-lg">
          Providing Orthodontic and general dental care across four clinics in Mokattam, Sheikh Zayed, Kafr El-Zayat, and Tanta, with a focus on precise, comfortable, and personalized treatment for every patient.

        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/book"
            className="rounded-full bg-latte px-7 py-3.5 text-sm font-semibold text-espresso transition hover:bg-latte-light"
          >
            Book an Appointment
          </Link>
          <a
            href="tel:01092728428"
            className="rounded-full border border-cream/40 px-7 py-3.5 text-sm font-semibold text-warm-white transition hover:bg-warm-white/10"
          >
            Call 
          </a>
        </div>
      </div>
    </section>
  );
}
