import { prisma } from "@/lib/prisma";
import { toDateKey, parseDateKey } from "@/lib/availability";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const today = parseDateKey(toDateKey(new Date()));

  const [total, todayCount, pending, confirmed, completed, cancelled, noShow, totalPatients, recent] =
    await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { appointmentDate: today } }),
      prisma.appointment.count({ where: { status: "PENDING" } }),
      prisma.appointment.count({ where: { status: "CONFIRMED" } }),
      prisma.appointment.count({ where: { status: "COMPLETED" } }),
      prisma.appointment.count({ where: { status: "CANCELLED" } }),
      prisma.appointment.count({ where: { status: "NO_SHOW" } }),
      prisma.patient.count(),
      prisma.appointment.findMany({
        include: { patient: true, location: true, service: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  const cards = [
    { label: "Today's Appointments", value: todayCount },
    { label: "Pending", value: pending },
    { label: "Confirmed", value: confirmed },
    { label: "Completed", value: completed },
    { label: "Cancelled", value: cancelled },
    { label: "No-show", value: noShow },
    { label: "Total Appointments", value: total },
    { label: "Total Patients", value: totalPatients },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-espresso">Overview</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-latte-light bg-warm-white p-5">
            <p className="text-2xl font-semibold text-espresso">{c.value}</p>
            <p className="mt-1 text-xs text-espresso-soft/70">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-espresso">Recent Appointments</h2>
          <Link href="/admin/appointments" className="text-sm font-medium text-coffee">
            View all →
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-latte-light bg-warm-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-latte-light text-left text-xs uppercase text-espresso-soft/60">
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((a: (typeof recent)[number]) => (
                <tr key={a.id} className="border-b border-latte-light/60 last:border-0">
                  <td className="px-4 py-3">{a.patient.fullName}</td>
                  <td className="px-4 py-3">{a.location.name}</td>
                  <td className="px-4 py-3">{a.service.name}</td>
                  <td className="px-4 py-3">
                    {a.appointmentDate.toISOString().slice(0, 10)} {a.appointmentTime}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-cream-dark px-2.5 py-1 text-xs font-medium">
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-espresso-soft">
                    No appointments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
