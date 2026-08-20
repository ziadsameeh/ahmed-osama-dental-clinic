import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// weekday convention: 0 = Sunday ... 6 = Saturday (JS Date.getDay())
const WEEKDAYS = [
  { key: "sunday", value: 0 },
  { key: "monday", value: 1 },
  { key: "tuesday", value: 2 },
  { key: "wednesday", value: 3 },
  { key: "thursday", value: 4 },
  { key: "friday", value: 5 },
  { key: "saturday", value: 6 },
] as const;

const OPEN_ALL_EXCEPT_THURSDAY = WEEKDAYS.map((d) => ({ weekday: d.value, isAvailable: d.key !== "thursday" }));
const WED_THU_ONLY = WEEKDAYS.map((d) => ({ weekday: d.value, isAvailable: d.key === "wednesday" || d.key === "thursday" }));

async function main() {
  // ---------------------------------------------------------------------
  // Admin user
  // ---------------------------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@drahmedosama.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash, name: "Dr. Ahmed Osama Sameeh" },
  });

  // ---------------------------------------------------------------------
  // Doctor profile
  // ---------------------------------------------------------------------
  const existingDoctor = await prisma.doctor.findFirst();
  const doctorData = {
    name: "Dr. Ahmed Osama Sameeh",
    specialty: "Orthodontist",
    bio: "[TO BE PROVIDED] — a short professional biography for Dr. Ahmed Osama Sameeh will appear here once supplied.",
    education: "Tanta University",
    // The exact certificate wording for the RCSEd qualification has not been
    // confirmed yet — do not guess between MOrth RCSEd and MFDS RCSEd.
    qualifications: "[TO BE PROVIDED] — official Royal College of Surgeons of Edinburgh (RCSEd) qualification wording",
    hospital: "Kafr El-Zayat Hospital",
    phone: "01092728428",
    profileImage: "/images/doctor-hero.jpeg",
  };
  if (existingDoctor) {
    await prisma.doctor.update({ where: { id: existingDoctor.id }, data: doctorData });
  } else {
    await prisma.doctor.create({ data: doctorData });
  }

  // ---------------------------------------------------------------------
  // Locations + schedules + working hours
  // ---------------------------------------------------------------------
  const locations = [
    {
      slug: "mokattam",
      name: "Mokattam",
      clinicName: "[TO BE PROVIDED]",
      address: "[TO BE PROVIDED]",
      phone: "01092728428",
      mapsUrl: null,
      schedule: OPEN_ALL_EXCEPT_THURSDAY,
    },
    {
      slug: "zayed",
      name: "Shiekh Zayed",
      clinicName: "[TO BE PROVIDED]",
      address: "[TO BE PROVIDED]",
      phone: "01092728428",
      mapsUrl: null,
      schedule: OPEN_ALL_EXCEPT_THURSDAY,
    },
    {
      slug: "kafr-el-zayat",
      name: "Kafr El-Zayat",
      clinicName: "Masters Dental Clinic",
      address: "[TO BE PROVIDED]",
      phone: "01092728428",
      mapsUrl: null,
      schedule: WED_THU_ONLY,
    },
    {
      slug: "tanta",
      name: "Tanta",
      clinicName: "[TO BE PROVIDED]",
      address: "[TO BE PROVIDED]",
      phone: "01092728428",
      mapsUrl: null,
      schedule: WED_THU_ONLY,
    },
  ];

  for (const loc of locations) {
    const location = await prisma.location.upsert({
      where: { slug: loc.slug },
      update: {
        name: loc.name,
        clinicName: loc.clinicName,
        address: loc.address,
        phone: loc.phone,
        mapsUrl: loc.mapsUrl,
      },
      create: {
        slug: loc.slug,
        name: loc.name,
        clinicName: loc.clinicName,
        address: loc.address,
        phone: loc.phone,
        mapsUrl: loc.mapsUrl,
      },
    });

    for (const entry of loc.schedule) {
      await prisma.weeklyAvailability.upsert({
        where: { locationId_weekday: { locationId: location.id, weekday: entry.weekday } },
        update: { isAvailable: entry.isAvailable },
        create: { locationId: location.id, weekday: entry.weekday, isAvailable: entry.isAvailable },
      });
    }

    // Placeholder working hours — admin should update these from the
    // dashboard once real clinic hours are confirmed.
    await prisma.workingHour.upsert({
      where: { locationId: location.id },
      update: {},
      create: {
        locationId: location.id,
        openTime: "10:00",
        closeTime: "18:00",
        breakStart: "14:00",
        breakEnd: "15:00",
        slotMinutes: 30,
      },
    });
  }

  // ---------------------------------------------------------------------
  // Services (no invented prices)
  // ---------------------------------------------------------------------
  const services = [
    {
      slug: "orthodontics",
      name: "Orthodontics",
      description:
        "Braces and orthodontic treatment to align teeth and improve bite, tailored to each patient's case by Dr. Ahmed Osama Sameeh.",
      sortOrder: 0,
    },
    {
      slug: "dental-fillings",
      name: "Dental Fillings",
      description: "Restoring decayed or damaged teeth to their normal function and shape.",
      sortOrder: 1,
    },
    {
      slug: "teeth-cleaning",
      name: "Professional Teeth Cleaning",
      description: "Thorough removal of plaque and tartar to support long-term gum and tooth health.",
      sortOrder: 2,
    },
    {
      slug: "teeth-whitening",
      name: "Teeth Whitening",
      description: "Professional whitening to brighten your smile safely.",
      sortOrder: 3,
    },
  ];

  for (const svc of services) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: { name: svc.name, description: svc.description, sortOrder: svc.sortOrder },
      create: { ...svc, price: null, estimatedDuration: null },
    });
  }

  // ---------------------------------------------------------------------
  // Site settings
  // ---------------------------------------------------------------------
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "Dr. Ahmed Osama Sameeh — Dental & Orthodontic Care",
      mainPhone: "01092728428",
      metaDescription:
        "Dr. Ahmed Osama Sameeh, Orthodontist, offering orthodontics, fillings, cleaning and whitening across Mokattam, Zayed, Kafr El-Zayat and Tanta.",
    },
  });

  // ---------------------------------------------------------------------
  // FAQs (general, non-medical-claim starter content — editable in admin)
  // ---------------------------------------------------------------------
  const faqCount = await prisma.fAQ.count();
  if (faqCount === 0) {
    await prisma.fAQ.createMany({
      data: [
        {
          question: "Do I need a referral to book an appointment?",
          answer: "No referral is needed. You can book directly through the website by choosing a clinic, service, date and time.",
          sortOrder: 0,
        },
        {
          question: "Which clinics does Dr. Ahmed Osama Sameeh see patients at?",
          answer: "Dr. Ahmed Osama Sameeh sees patients across four locations: Mokattam, Zayed, Kafr El-Zayat, and Tanta. Each clinic has its own weekly schedule shown on the booking page.",
          sortOrder: 1,
        },
        {
          question: "What should I bring to my first appointment?",
          answer: "Please bring a valid ID and, if available, any relevant previous dental records or X-rays.",
          sortOrder: 2,
        },
      ],
    });
  }

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
