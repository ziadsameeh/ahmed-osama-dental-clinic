import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-latte-light/60 bg-espresso text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-semibold">Dr. Ahmed Osama Sameeh</p>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-latte">Orthodontist</p>
          <p className="mt-4 max-w-xs text-sm text-cream/70">
            Orthodontics and general dental care across four clinics: Mokattam, Zayed, Kafr El-Zayat and Tanta.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-latte">Contact</p>
          <a href="tel:01092728428" className="block text-sm text-cream/80 hover:text-cream">
            Call: 01092728428
          </a>
          <p className="mt-1 text-sm text-cream/50">Email &amp; social links: to be provided</p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-latte">Explore</p>
          <div className="flex flex-col gap-2 text-sm text-cream/80">
            <Link href="/#services" className="hover:text-cream">Services</Link>
            <Link href="/#locations" className="hover:text-cream">Locations</Link>
            <Link href="/book" className="hover:text-cream">Book an Appointment</Link>
            <Link href="/admin/login" className="hover:text-cream">Admin</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10 px-5 py-5 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} Dr. Ahmed Osama Sameeh. All rights reserved.
      </div>
    </footer>
  );
}
