"use client";

import { useEffect, useState, useCallback } from "react";

type Testimonial = { id: string; patientName: string; content: string; rating: number | null; isPublished: boolean };

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [patientName, setPatientName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState("5");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/testimonials")
      .then((r) => r.json())
      .then((data) => setItems(data.testimonials ?? []));
  }, []);

  useEffect(() => load(), [load]);

  async function addTestimonial(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientName, content, rating: rating ? Number(rating) : null }),
    });
    if (!res.ok) {
      setError("Failed to add testimonial.");
      return;
    }
    setPatientName("");
    setContent("");
    load();
  }

  async function togglePublished(t: Testimonial) {
    await fetch(`/api/admin/testimonials/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !t.isPublished }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-espresso">Testimonials</h1>
      <p className="mt-1 text-sm text-espresso-soft/70">
        Add real patient reviews manually. Only published testimonials appear on the homepage.
      </p>

      <form onSubmit={addTestimonial} className="mt-6 grid gap-3 rounded-2xl border border-latte-light bg-warm-white p-5 sm:grid-cols-2">
        <label className="text-sm">
          Patient name
          <input
            required
            className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
        </label>
        <label className="text-sm">
          Rating (1-5)
          <input
            type="number"
            min={1}
            max={5}
            className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          Review
          <textarea
            required
            rows={3}
            className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className="rounded-full bg-espresso px-5 py-2 text-sm font-medium text-warm-white hover:bg-coffee-dark">
            Add testimonial
          </button>
        </div>
        {error && <p className="text-sm text-error sm:col-span-2">{error}</p>}
      </form>

      <div className="mt-6 grid gap-3">
        {items.map((t) => (
          <div key={t.id} className="rounded-2xl border border-latte-light bg-warm-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-espresso">
                  {t.patientName} {t.rating && <span className="text-xs text-latte">{"★".repeat(t.rating)}</span>}
                </p>
                <p className="mt-1 text-sm text-espresso-soft/80">{t.content}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${t.isPublished ? "bg-sage-light text-sage" : "bg-cream-dark text-espresso-soft/60"}`}>
                  {t.isPublished ? "Published" : "Draft"}
                </span>
                <button onClick={() => togglePublished(t)} className="text-xs font-medium text-coffee hover:underline">
                  {t.isPublished ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => remove(t.id)} className="text-xs font-medium text-error hover:underline">
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
