import Link from "next/link";
import { getCurrentAdmin } from "@/lib/auth";
import LogoutButton from "@/components/admin/LogoutButton";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/locations", label: "Locations" },
  { href: "/admin/schedule", label: "Schedule" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/doctor", label: "Doctor Profile" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/testimonials", label: "Testimonials" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();

  return (
    <div className="min-h-screen bg-cream text-espresso">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-latte-light bg-warm-white p-6 md:block">
          <p className="font-display text-lg font-semibold text-espresso">Admin Dashboard</p>
          <p className="mt-1 text-xs text-espresso-soft/70">Dr. Ahmed Osama Sameeh</p>

          <nav className="mt-8 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-espresso-soft hover:bg-cream-dark hover:text-espresso"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-10 border-t border-latte-light pt-4">
            <p className="text-xs text-espresso-soft/70">{admin?.email}</p>
            <LogoutButton />
          </div>
        </aside>

        <div className="flex-1 p-6 md:p-10">{children}</div>
      </div>
    </div>
  );
}
