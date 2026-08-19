"use client";

import { useEffect, useState, useCallback } from "react";

type FAQ = { id: string; question: string; answer: string; isActive: boolean; sortOrder: number };

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/faqs")
      .then((r) => r.json())
      .then((data) => setFaqs(data.faqs ?? []));
  }, []);

  useEffect(() => load(), [load]);

  async function addFaq(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer, sortOrder: faqs.length }),
    });
    if (!res.ok) {
      setError("Failed to add FAQ.");
      return;
    }
    setQuestion("");
    setAnswer("");
    load();
  }

  async function toggleActive(faq: FAQ) {
    await fetch(`/api/admin/faqs/${faq.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !faq.isActive }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-espresso">FAQs</h1>
      <p className="mt-1 text-sm text-espresso-soft/70">Manage frequently asked questions shown on the homepage.</p>

      <form onSubmit={addFaq} className="mt-6 grid gap-3 rounded-2xl border border-latte-light bg-warm-white p-5">
        <label className="text-sm">
          Question
          <input
            required
            className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </label>
        <label className="text-sm">
          Answer
          <textarea
            required
            rows={3}
            className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </label>
        <button type="submit" className="w-fit rounded-full bg-espresso px-5 py-2 text-sm font-medium text-warm-white hover:bg-coffee-dark">
          Add FAQ
        </button>
        {error && <p className="text-sm text-error">{error}</p>}
      </form>

      <div className="mt-6 grid gap-3">
        {faqs.map((f) => (
          <div key={f.id} className="rounded-2xl border border-latte-light bg-warm-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-espresso">{f.question}</p>
                <p className="mt-1 text-sm text-espresso-soft/80">{f.answer}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button onClick={() => toggleActive(f)} className="text-xs font-medium text-coffee hover:underline">
                  {f.isActive ? "Hide" : "Show"}
                </button>
                <button onClick={() => remove(f.id)} className="text-xs font-medium text-error hover:underline">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
