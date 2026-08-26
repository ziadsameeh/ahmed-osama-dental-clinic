import type { Metadata } from "next";
import ManageAppointment from "@/components/manage/ManageAppointment";

export const metadata: Metadata = {
  title: "Manage Your Appointment",
  robots: { index: false, follow: false },
};

export default async function ManageAppointmentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="mx-auto max-w-xl px-5 py-16 sm:py-24">
      <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-coffee">
        Dr. Ahmed Osama Sameeh
      </p>

      <div className="mt-6">
        <ManageAppointment token={token} />
      </div>
    </div>
  );
}