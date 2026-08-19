"use client";

import { useEffect, useState, useCallback } from "react";

type Service = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string | null;
  estimatedDuration: number | null;
  isActive: boolean;
};

const emptyForm = { name: "", slug: "", description: "", price: "", estimatedDuration: "" };

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/services")
      .then((r) => r.json())
      .then((data) => setServices(data.services ?? []))
      .finally(() => setLoading(false));
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
  useEffect(() => load(), [load]);

  async function addService(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: form.price ? Number(form.price) : null,
        estimatedDuration: form.estimatedDuration ? Number(form.estimatedDuration) : null,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add service.");
      return;
    }
    setForm(emptyForm);
    load();
  }

  async function toggleActive(service: Service) {
    await fetch(`/api/admin/services/${service.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !service.isActive }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this service? This cannot be undone.")) return;
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-espresso">Services</h1>
      <p className="mt-1 text-sm text-espresso-soft/70">Add, edit, enable or disable the services offered across clinics.</p>

      <form onSubmit={addService} className="mt-6 grid gap-3 rounded-2xl border border-latte-light bg-warm-white p-5 sm:grid-cols-2">
        <label className="text-sm">
          Name
          <input
            required
            className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </label>
        <label className="text-sm">
          Slug
          <input
            required
            placeholder="e.g. root-canal"
            className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          Description
          <textarea
            className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </label>
        <label className="text-sm">
          Price (optional)
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
        </label>
        <label className="text-sm">
          Est. duration (min, optional)
          <input
            type="number"
            min={5}
            className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            value={form.estimatedDuration}
            onChange={(e) => setForm((f) => ({ ...f, estimatedDuration: e.target.value }))}
          />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className="rounded-full bg-espresso px-5 py-2 text-sm font-medium text-warm-white hover:bg-coffee-dark">
            Add service
          </button>
        </div>
        {error && <p className="text-sm text-error sm:col-span-2">{error}</p>}
      </form>

      <div className="mt-6 grid gap-3">
        {!loading &&
          services.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-latte-light bg-warm-white p-4">
              <div>
                <p className="font-medium text-espresso">{s.name}</p>
                <p className="text-xs text-espresso-soft/60">{s.slug}</p>
                {s.description && <p className="mt-1 max-w-xl text-sm text-espresso-soft/80">{s.description}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.isActive ? "bg-sage-light text-sage" : "bg-cream-dark text-espresso-soft/60"}`}>
                  {s.isActive ? "Active" : "Disabled"}
                </span>
                <button onClick={() => toggleActive(s)} className="text-xs font-medium text-coffee hover:underline">
                  {s.isActive ? "Disable" : "Enable"}
                </button>
                <button onClick={() => remove(s.id)} className="text-xs font-medium text-error hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
