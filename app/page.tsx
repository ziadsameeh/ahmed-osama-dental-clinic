import { prisma } from "@/lib/prisma";
import Hero from "@/components/Hero";
import DoctorIntro from "@/components/DoctorIntro";
import Services from "@/components/Services";
import WhyChooseUs from "@/components/WhyChooseUs";
import Locations from "@/components/Locations";
import AppointmentCTA from "@/components/AppointmentCTA";
import FaqSection from "@/components/FaqSection";
import Testimonials from "@/components/Testimonials";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [doctor, services, locations, faqs, testimonials] = await Promise.all([
    prisma.doctor.findFirst(),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.location.findMany({
      where: { isActive: true },
      include: { weeklyAvailability: { orderBy: { weekday: "asc" } } },
      orderBy: { name: "asc" },
    }),
    prisma.fAQ.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.testimonial.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: doctor?.name ?? "Dr. Ahmed Osama Sameeh",
    medicalSpecialty: "Orthodontics",
    url: siteUrl,
    telephone: doctor?.phone ?? "01092728428",
    image: `${siteUrl}${doctor?.profileImage ?? "/images/doctor-hero.jpeg"}`,
    areaServed: locations.map((l: (typeof locations)[number]) => l.name),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Hero doctorImage={doctor?.profileImage ?? "/images/doctor-hero.jpeg"} />
      <DoctorIntro doctor={doctor} />
      <Services services={services} />
      <WhyChooseUs />
      <Locations locations={locations} />
      <AppointmentCTA />
      <FaqSection faqs={faqs} />
      <Testimonials testimonials={testimonials} />
    </>
  );
}
