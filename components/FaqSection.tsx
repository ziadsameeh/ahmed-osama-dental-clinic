type Faq = { id: string; question: string; answer: string };

export default function FaqSection({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;
  return (
    <section id="faq" className="bg-cream-dark/40 py-20">
      <div className="mx-auto max-w-3xl px-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-coffee">FAQ</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-espresso sm:text-4xl">
          Common questions
        </h2>

        <div className="mt-8 divide-y divide-latte-light rounded-2xl border border-latte-light bg-warm-white">
          {faqs.map((faq) => (
            <details key={faq.id} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-espresso font-medium">
                {faq.question}
                <span className="ml-4 text-coffee transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-espresso-soft">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
