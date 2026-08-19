-- Hand-written equivalent of prisma/schema.prisma, used ONLY to verify the
-- schema design and business rules against a real PostgreSQL instance in
-- this sandbox, where `prisma migrate`/`generate` cannot reach
-- binaries.prisma.sh to download engines. On a normal machine, running
-- `npx prisma migrate dev` creates the real migration automatically --
-- this file is not part of the shipped app.

CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

CREATE TABLE "Location" (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE "WeeklyAvailability" (
  id TEXT PRIMARY KEY,
  "locationId" TEXT NOT NULL REFERENCES "Location"(id) ON DELETE CASCADE,
  weekday INT NOT NULL,
  "isAvailable" BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE ("locationId", weekday)
);

CREATE TABLE "WorkingHour" (
  id TEXT PRIMARY KEY,
  "locationId" TEXT UNIQUE NOT NULL REFERENCES "Location"(id) ON DELETE CASCADE,
  "openTime" TEXT NOT NULL DEFAULT '10:00',
  "closeTime" TEXT NOT NULL DEFAULT '18:00',
  "breakStart" TEXT,
  "breakEnd" TEXT,
  "slotMinutes" INT NOT NULL DEFAULT 30
);

CREATE TABLE "BlockedDate" (
  id TEXT PRIMARY KEY,
  "locationId" TEXT REFERENCES "Location"(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT,
  UNIQUE ("locationId", date)
);

CREATE TABLE "Service" (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE "Patient" (
  id TEXT PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  age INT NOT NULL,
  gender "Gender" NOT NULL,
  phone TEXT NOT NULL
);

CREATE TABLE "Appointment" (
  id TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "Patient"(id) ON DELETE CASCADE,
  "locationId" TEXT NOT NULL REFERENCES "Location"(id),
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id),
  "appointmentDate" DATE NOT NULL,
  "appointmentTime" TEXT NOT NULL,
  status "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
  UNIQUE ("locationId", "appointmentDate", "appointmentTime")
);
