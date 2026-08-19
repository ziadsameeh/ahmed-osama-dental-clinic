import Link from "next/link";

type Service = {
  id: string;
  name: string;
  description: string | null;
};

export default function Services({ services }: { services: Service[] }) {
  return (
    <section id="services" className="bg-cream-dark/40 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-coffee">Services</p>
        <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold text-espresso sm:text-4xl">
          Orthodontic and general dental care
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-col rounded-2xl border border-latte-light bg-warm-white p-6"
            >
              <h3 className="font-display text-lg font-semibold text-espresso">{service.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-espresso-soft">
                {service.description ?? ""}
              </p>
              <Link
                href="/book"
                className="mt-5 text-sm font-semibold text-coffee hover:text-coffee-dark"
              >
                Book this service →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
