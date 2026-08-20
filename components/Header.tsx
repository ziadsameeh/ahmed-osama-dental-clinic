"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/#doctor", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/#locations", label: "Locations" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-latte-light/60 bg-warm-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-espresso">
          Dr. Ahmed Osama Sameeh
          <span className="ml-2 hidden text-xs font-sans font-normal uppercase tracking-[0.2em] text-coffee sm:inline">
            Orthodontist
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-espresso-soft transition hover:text-coffee"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="tel:01092728428"
            className="text-sm font-medium text-espresso-soft transition hover:text-coffee"
          >
            Call
          </a>
          <Link
            href="/book"
            className="rounded-full bg-coffee px-5 py-2.5 text-sm font-semibold text-warm-white transition hover:bg-coffee-dark"
          >
            Book an Appointment
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-latte-light md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <div className="flex flex-col gap-1.5">
            <span className="h-0.5 w-5 bg-espresso" />
            <span className="h-0.5 w-5 bg-espresso" />
            <span className="h-0.5 w-5 bg-espresso" />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t border-latte-light/60 bg-warm-white px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-espresso-soft"
              >
                {link.label}
              </Link>
            ))}
            <a href="tel:01092728428" className="text-base font-medium text-coffee">
              Call 01092728428
            </a>
            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-coffee px-5 py-3 text-center text-sm font-semibold text-warm-white"
            >
              Book an Appointment
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
