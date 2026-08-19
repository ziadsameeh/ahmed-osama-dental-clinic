"use client";

import { useEffect, useState } from "react";

type Doctor = {
  name: string;
  specialty: string;
  bio: string | null;
  education: string | null;
  qualifications: string | null;
  hospital: string | null;
  phone: string;
  profileImage: string | null;
};

export default function AdminDoctorPage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/doctor")
      .then((r) => r.json())
      .then((data) => setDoctor(data.doctor));
  }, []);

  async function save(e: React.FormEvent) {
  e.preventDefault();
  if (!doctor) return;
  

  setSaving(true);
  setMessage(null);

  try {
    const res = await fetch("/api/admin/doctor", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doctor),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setMessage(data?.error ?? `Failed to save (${res.status})`);
      return;
    }

    setDoctor(data.doctor);
    setMessage("Saved successfully.");
  } catch (error) {
    setMessage(
      error instanceof Error ? error.message : "Network error. Please try again."
    );
  } finally {
    setSaving(false);
  }
  }


  if (!doctor) return <p className="text-espresso-soft/70">Loading…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-espresso">Doctor Profile</h1>
      <p className="mt-1 text-sm text-espresso-soft/70">
        This information appears across the public site. Use exact official wording for qualifications once confirmed.
      </p>

      <form onSubmit={save} className="mt-6 grid max-w-2xl gap-4 rounded-2xl border border-latte-light bg-warm-white p-6">
        <label className="text-sm">
          Name
          <input
            className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            value={doctor.name}
            onChange={(e) => setDoctor({ ...doctor, name: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Specialty
          <input
            className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            value={doctor.specialty}
            onChange={(e) => setDoctor({ ...doctor, specialty: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Biography
          <textarea
            rows={4}
            className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            value={doctor.bio ?? ""}
            onChange={(e) => setDoctor({ ...doctor, bio: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Education
          <input
            className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            value={doctor.education ?? ""}
            onChange={(e) => setDoctor({ ...doctor, education: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Qualifications
          <textarea
            rows={2}
            className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            value={doctor.qualifications ?? ""}
            onChange={(e) => setDoctor({ ...doctor, qualifications: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Hospital affiliation
          <input
            className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            value={doctor.hospital ?? ""}
            onChange={(e) => setDoctor({ ...doctor, hospital: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Phone
          <input
            className="mt-1 w-full rounded-lg border border-latte-light bg-cream px-3 py-2 text-sm"
            value={doctor.phone}
            onChange={(e) => setDoctor({ ...doctor, phone: e.target.value })}
          />
        </label>

        <button disabled={saving} type="submit" className="w-fit rounded-full bg-espresso px-5 py-2 text-sm font-medium text-warm-white hover:bg-coffee-dark disabled:opacity-60">
          {saving ? "Saving…" : "Save profile"}
        </button>
        {message && <p className="text-sm text-espresso-soft/70">{message}</p>}
      </form>
    </div>
  );
}
