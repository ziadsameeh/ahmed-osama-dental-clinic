type Testimonial = { id: string; patientName: string; content: string; rating: number | null };

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-coffee">Testimonials</p>
      <h2 className="mt-3 font-display text-3xl font-semibold text-espresso sm:text-4xl">
        What patients say
      </h2>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <blockquote key={t.id} className="rounded-2xl border border-latte-light bg-warm-white p-6">
            {t.rating && (
              <div className="mb-2 text-latte" aria-hidden>
                {"★".repeat(t.rating)}
                {"☆".repeat(Math.max(0, 5 - t.rating))}
              </div>
            )}
            <p className="text-sm leading-relaxed text-espresso-soft">&ldquo;{t.content}&rdquo;</p>
            <footer className="mt-4 text-sm font-semibold text-espresso">{t.patientName}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
