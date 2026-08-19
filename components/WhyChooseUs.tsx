const POINTS = [
  {
    title: "Orthodontic focus",
    body: "Orthodontics is Dr. Ahmed's primary specialty, alongside general dental services for the whole family.",
  },
  {
    title: "Four convenient locations",
    body: "Clinics in Mokattam, Zayed, Kafr El-Zayat and Tanta, each with its own weekly schedule.",
  },
  {
    title: "Simple online booking",
    body: "Choose a clinic, service, date and time — no account or password required.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-coffee">Why Choose Us</p>
      <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold text-espresso sm:text-4xl">
        Care built around your schedule
      </h2>

      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        {POINTS.map((point) => (
          <div key={point.title} className="border-t-2 border-latte pt-5">
            <h3 className="font-display text-lg font-semibold text-espresso">{point.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-espresso-soft">{point.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
