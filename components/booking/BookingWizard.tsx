"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Calendar from "./Calendar";

type Location = { id: string; name: string; clinicName: string | null };
type Service = { id: string; name: string; description: string | null };

type ConfirmedAppointment = {
  appointmentDate: string;
  appointmentTime: string;
  patient: { fullName: string; phone: string };
  location: { name: string };
  service: { name: string };
};

const STEPS = ["Location", "Service", "Date", "Time", "Your Info", "Confirm"];

function StepHeader({ step }: { step: number }) {
  return (
    <ol className="mb-8 flex flex-wrap gap-2 text-xs font-medium">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state = n === step ? "current" : n < step ? "done" : "upcoming";
        return (
          <li
            key={label}
            className={[
              "flex items-center gap-1.5 rounded-full px-3 py-1.5",
              state === "current" && "bg-coffee text-warm-white",
              state === "done" && "bg-sage-light text-sage",
              state === "upcoming" && "bg-cream-dark text-espresso-soft/50",
            ].join(" ")}
          >
            <span>{n}</span>
            <span>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default function BookingWizard() {
  const searchParams = useSearchParams();
  const preselectedLocation = searchParams.get("location");

  const [step, setStep] = useState(1);
  const [locations, setLocations] = useState<Location[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [locationId, setLocationId] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const [slots, setSlots] = useState<string[]>([]);
  const [slotsMessage, setSlotsMessage] = useState<string | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    age: "",
    gender: "" as "" | "MALE" | "FEMALE",
    phone: "",
    email: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<ConfirmedAppointment | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/locations").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
    ])
      .then(([locData, svcData]) => {
        setLocations(locData.locations ?? []);
        setServices(svcData.services ?? []);
        if (preselectedLocation) setLocationId(preselectedLocation);
      })
      .finally(() => setLoadingOptions(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!locationId || !date) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting derived state on selection change
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    setSlotsMessage(null);
    fetch(`/api/availability/slots?locationId=${locationId}&date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots ?? []);
        setSlotsMessage(data.message ?? null);
      })
      .finally(() => setSlotsLoading(false));
  }, [locationId, date]);

  const selectedLocation = useMemo(() => locations.find((l) => l.id === locationId), [locations, locationId]);
  const selectedService = useMemo(() => services.find((s) => s.id === serviceId), [services, serviceId]);

  function validateForm() {
    const errors: Record<string, string> = {};
    if (form.fullName.trim().length < 2) errors.fullName = "Please enter your full name.";
    const ageNum = Number(form.age);
    if (!form.age || !Number.isInteger(ageNum) || ageNum <= 0 || ageNum > 120) {
      errors.age = "Please enter a valid age.";
    }
    if (!form.gender) errors.gender = "Please select a gender.";
    if (!/^(\+?\d[\d\s-]{7,14}\d)$/.test(form.phone.trim())) errors.phone = "Please enter a valid phone number.";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Please enter a valid email.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleConfirm() {
    if (!locationId || !serviceId || !date || !time) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId,
          serviceId,
          date,
          time,
          fullName: form.fullName.trim(),
          age: Number(form.age),
          gender: form.gender,
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          notes: form.notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        if (res.status === 409) {
          // Slot was taken in the meantime — send them back to pick a new time.
          setTime(null);
          setStep(4);
        }
        return;
      }
      setConfirmedAppointment(data.appointment);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedAppointment) {
    return (
      <div className="rounded-3xl border border-sage/40 bg-sage-light p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sage text-2xl text-warm-white">
          ✓
        </div>
        <h2 className="font-display text-2xl font-semibold text-espresso">Appointment Requested</h2>
        <p className="mt-2 text-espresso-soft">
          Thank you, {confirmedAppointment.patient.fullName}. We&apos;ve received your request for{" "}
          <strong>{confirmedAppointment.service.name}</strong> at{" "}
          <strong>{confirmedAppointment.location.name}</strong> on{" "}
          <strong>{confirmedAppointment.appointmentDate.slice(0, 10)}</strong> at{" "}
          <strong>{confirmedAppointment.appointmentTime}</strong>.
        </p>
        <p className="mt-2 text-sm text-espresso-soft">
          Your appointment is pending confirmation. We&apos;ll contact you at {confirmedAppointment.patient.phone}.
        </p>
      </div>
    );
  }

  if (loadingOptions) {
    return <p className="text-espresso-soft">Loading booking options…</p>;
  }

  return (
    <div>
      <StepHeader step={step} />

      {step === 1 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {locations.map((loc) => (
            <button
              key={loc.id}
              type="button"
              onClick={() => {
                setLocationId(loc.id);
                setDate(null);
                setTime(null);
                setStep(2);
              }}
              className={[
                "rounded-2xl border p-5 text-left transition",
                locationId === loc.id
                  ? "border-coffee bg-cream-dark"
                  : "border-latte-light bg-warm-white hover:border-latte",
              ].join(" ")}
            >
              <p className="font-display text-lg font-semibold text-espresso">{loc.name}</p>
              {loc.clinicName && loc.clinicName !== "[TO BE PROVIDED]" && (
                <p className="text-sm text-espresso-soft">{loc.clinicName}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((svc) => (
            <button
              key={svc.id}
              type="button"
              onClick={() => {
                setServiceId(svc.id);
                setStep(3);
              }}
              className={[
                "rounded-2xl border p-5 text-left transition",
                serviceId === svc.id
                  ? "border-coffee bg-cream-dark"
                  : "border-latte-light bg-warm-white hover:border-latte",
              ].join(" ")}
            >
              <p className="font-display text-lg font-semibold text-espresso">{svc.name}</p>
              {svc.description && <p className="mt-1 text-sm text-espresso-soft">{svc.description}</p>}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-left text-sm font-medium text-espresso-soft underline sm:col-span-2"
          >
            ← Back to location
          </button>
        </div>
      )}

      {step === 3 && locationId && (
        <div>
          <Calendar
            locationId={locationId}
            selectedDate={date}
            onSelect={(d) => {
              setDate(d);
              setTime(null);
              setStep(4);
            }}
          />
          <button
            type="button"
            onClick={() => setStep(2)}
            className="mt-4 text-sm font-medium text-espresso-soft underline"
          >
            ← Back to service
          </button>
        </div>
      )}

      {step === 4 && (
        <div>
          {slotsLoading && <p className="text-espresso-soft">Loading available times…</p>}
          {!slotsLoading && slotsMessage && (
            <p className="rounded-xl bg-cream-dark p-4 text-sm text-espresso-soft">{slotsMessage}</p>
          )}
          {!slotsLoading && !slotsMessage && slots.length === 0 && (
            <p className="rounded-xl bg-cream-dark p-4 text-sm text-espresso-soft">
              No times are left on this date. Please choose another date.
            </p>
          )}
          {!slotsLoading && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setTime(s);
                    setStep(5);
                  }}
                  className={[
                    "rounded-xl border px-3 py-3 text-sm font-medium transition",
                    time === s
                      ? "border-coffee bg-coffee text-warm-white"
                      : "border-latte-light bg-warm-white hover:border-latte",
                  ].join(" ")}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setStep(3)}
            className="mt-4 text-sm font-medium text-espresso-soft underline"
          >
            ← Back to date
          </button>
        </div>
      )}

      {step === 5 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (validateForm()) setStep(6);
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-espresso">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full rounded-xl border border-latte-light bg-warm-white px-4 py-3 text-sm"
              required
            />
            {formErrors.fullName && <p className="mt-1 text-sm text-error">{formErrors.fullName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="mb-1 block text-sm font-medium text-espresso">
                Age
              </label>
              <input
                id="age"
                type="number"
                min={1}
                max={120}
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="w-full rounded-xl border border-latte-light bg-warm-white px-4 py-3 text-sm"
                required
              />
              {formErrors.age && <p className="mt-1 text-sm text-error">{formErrors.age}</p>}
            </div>
            <div>
              <span className="mb-1 block text-sm font-medium text-espresso">Gender</span>
              <div className="flex gap-2">
                {(["MALE", "FEMALE"] as const).map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setForm({ ...form, gender: g })}
                    className={[
                      "flex-1 rounded-xl border px-3 py-3 text-sm font-medium",
                      form.gender === g
                        ? "border-coffee bg-coffee text-warm-white"
                        : "border-latte-light bg-warm-white",
                    ].join(" ")}
                  >
                    {g === "MALE" ? "Male" : "Female"}
                  </button>
                ))}
              </div>
              {formErrors.gender && <p className="mt-1 text-sm text-error">{formErrors.gender}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-espresso">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-latte-light bg-warm-white px-4 py-3 text-sm"
              required
            />
            {formErrors.phone && <p className="mt-1 text-sm text-error">{formErrors.phone}</p>}
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-espresso">
              Email <span className="text-espresso-soft/60">(optional)</span>
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-latte-light bg-warm-white px-4 py-3 text-sm"
            />
            {formErrors.email && <p className="mt-1 text-sm text-error">{formErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="notes" className="mb-1 block text-sm font-medium text-espresso">
              Additional Notes <span className="text-espresso-soft/60">(optional)</span>
            </label>
            <textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border border-latte-light bg-warm-white px-4 py-3 text-sm"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="text-sm font-medium text-espresso-soft underline"
            >
              ← Back to time
            </button>
            <button
              type="submit"
              className="ml-auto rounded-full bg-coffee px-7 py-3 text-sm font-semibold text-warm-white hover:bg-coffee-dark"
            >
              Review Appointment
            </button>
          </div>
        </form>
      )}

      {step === 6 && (
        <div>
          <div className="rounded-2xl border border-latte-light bg-warm-white p-6">
            <h3 className="font-display text-lg font-semibold text-espresso">Appointment Summary</h3>
            <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-espresso-soft/70">Patient</dt>
              <dd className="text-espresso">{form.fullName}</dd>
              <dt className="text-espresso-soft/70">Age / Gender</dt>
              <dd className="text-espresso">
                {form.age} · {form.gender === "MALE" ? "Male" : "Female"}
              </dd>
              <dt className="text-espresso-soft/70">Phone</dt>
              <dd className="text-espresso">{form.phone}</dd>
              <dt className="text-espresso-soft/70">Location</dt>
              <dd className="text-espresso">{selectedLocation?.name}</dd>
              <dt className="text-espresso-soft/70">Service</dt>
              <dd className="text-espresso">{selectedService?.name}</dd>
              <dt className="text-espresso-soft/70">Date</dt>
              <dd className="text-espresso">{date}</dd>
              <dt className="text-espresso-soft/70">Time</dt>
              <dd className="text-espresso">{time}</dd>
            </dl>
          </div>

          {submitError && (
            <p className="mt-4 rounded-xl bg-error/10 p-4 text-sm text-error">{submitError}</p>
          )}

          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setStep(5)}
              className="text-sm font-medium text-espresso-soft underline"
            >
              ← Edit details
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirm}
              className="ml-auto rounded-full bg-coffee px-7 py-3 text-sm font-semibold text-warm-white hover:bg-coffee-dark disabled:opacity-60"
            >
              {submitting ? "Booking…" : "Confirm Appointment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
