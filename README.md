# Dr. Ahmed Osama Sameeh — Dental & Orthodontic Website

A full-stack appointment booking website and admin dashboard, built with
Next.js (App Router), TypeScript, Tailwind CSS, PostgreSQL and Prisma.

---

## 1. Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend:** Next.js Route Handlers (`app/api/**`)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Custom admin auth — bcrypt password hashing + signed JWT session
  cookie (`jose`), no third-party auth provider needed for a single clinic
  administrator
- **Validation:** Zod, enforced server-side on every write endpoint
- **Fonts:** Self-hosted variable fonts (Fraunces + Inter) bundled in
  `app/fonts/` — the site never depends on reaching Google Fonts at runtime

## 2. Project structure

```text
dental-clinic/
├── app/
│   ├── api/                 # all backend routes (public + /api/admin/**)
│   ├── admin/                # admin dashboard pages (protected)
│   ├── book/                  # public booking flow
│   ├── fonts/                 # self-hosted font files
│   ├── page.tsx               # homepage
│   ├── sitemap.ts, robots.ts  # SEO
│   └── layout.tsx
├── components/                # homepage sections, booking wizard, admin bits
├── lib/                       # prisma client, auth, availability logic, zod schemas
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── verification/          # sandbox-only test scripts, see its README
├── proxy.ts                   # route protection for /admin and /api/admin (Next.js 16's replacement for middleware.ts)
├── .env.example
└── package.json
```

## 3. Getting started (Visual Studio Code)

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ running locally (or a connection string to a hosted instance)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment file and fill in real values
cp .env.example .env
# Edit .env: set DATABASE_URL, AUTH_SECRET (openssl rand -base64 32),
# ADMIN_EMAIL / ADMIN_PASSWORD for the first admin account.

# 3. Create the database (if it doesn't exist yet)
createdb dental_clinic     # or use psql / a GUI tool

# 4. Generate the Prisma client and run the first migration
npx prisma generate
npx prisma migrate dev --name init

# 5. Seed real starter data (doctor, 4 locations + schedules, 4 services, admin user)
npm run db:seed

# 6. Start the dev server
npm run dev
```

Visit `http://localhost:3000` for the public site and
`http://localhost:3000/admin/login` for the admin dashboard (credentials
come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`, set at seed time).

### Useful scripts

| Command              | What it does                                  |
|-----------------------|------------------------------------------------|
| `npm run dev`          | Start the dev server                           |
| `npm run build`        | Production build                               |
| `npm run start`        | Run the production build                       |
| `npm run db:generate`  | Regenerate the Prisma client after schema edits|
| `npm run db:migrate`   | Create/apply a migration in development        |
| `npm run db:deploy`    | Apply existing migrations (production)         |
| `npm run db:seed`      | Re-run the seed script                         |
| `npm run db:studio`    | Open Prisma Studio (visual DB browser)         |

## 4. What's implemented

**Public site:** hero (uses the supplied doctor photo), doctor introduction,
services, "why choose us", clinic locations with live weekly availability,
FAQ, testimonials, contact — all pulling from the database, not hardcoded.

**Booking flow (`/book`):** location → service → date (calendar disables
closed weekdays/blocked dates) → time (only real open slots) → patient info
(name, age, gender, phone required; email/notes optional) → summary →
confirm. Server re-validates everything and re-checks slot availability
inside a database transaction before creating the appointment, backed by a
`UNIQUE(locationId, appointmentDate, appointmentTime)` constraint as the
final guarantee against double booking.

**Admin dashboard (`/admin`):** login/logout, overview stats, appointment
list with search/filter (location, service, status, date) and status
changes (confirm/cancel/complete/no-show) + reschedule, locations & weekly
schedule & working-hours editor, blocked-dates manager, services CRUD,
doctor profile editor, FAQs CRUD, testimonials moderation (publish/unpublish).

**Security:** bcrypt-hashed passwords, signed httpOnly session cookies,
`proxy.ts` (Next.js 16's replacement for `middleware.ts`) protecting every
`/admin` page and `/api/admin/*` route, rate-limited login, Zod validation
on every write endpoint, no secrets committed (`.env.example` only).

**SEO:** per-page metadata, Open Graph tags, `sitemap.ts`, `robots.ts`,
canonical URL, and JSON-LD `Dentist` structured data on the homepage.

## 5. Scheduling rules (exactly as specified)

| Location        | Open days                                         |
|------------------|----------------------------------------------------|
| Mokattam          | Sat, Sun, Mon, Tue, Wed, Fri (closed Thursday)      |
| Zayed             | Sat, Sun, Mon, Tue, Wed, Fri (closed Thursday)      |
| Kafr El-Zayat     | Wednesday, Thursday only                            |
| Tanta             | Wednesday, Thursday only                            |

This is stored per-location in the `WeeklyAvailability` table (admin-editable
under **Locations & Schedule**), not hardcoded in the frontend. Working
hours, breaks and slot length are also admin-configurable per location
(placeholder: 10:00–18:00 with a 14:00–15:00 break, 30-minute slots — update
these once real hours are confirmed).

## 6. Testing performed

This project was built and iteratively tested in a sandboxed Linux
environment with a real local PostgreSQL 16 server. What was verified
directly, with commands re-runnable by you:

- **`npm run build`** compiles the entire app (all pages, all API routes)
  with zero errors *except* for type references that only exist once a real
  `prisma generate` has run (see the important caveat below) — every other
  file, including all 8 admin pages, type-checks cleanly.
- **Database schema** applied successfully to a live Postgres instance
  (`prisma/verification/schema_mirror.sql`).
- **Scheduling matrix** verified with real SQL queries against the seeded
  schedules: confirmed Mokattam/Zayed are open every day except Thursday,
  and Kafr El-Zayat/Tanta are open only Wednesday+Thursday — matching
  section 52 of the brief exactly (see
  `prisma/verification/test_data_and_matrix.sql` output).
- **Double-booking prevention** verified at the database level: inserting a
  second appointment for the same location+date+time was rejected by the
  `UNIQUE` constraint with a real Postgres error.
- **Slot-generation logic** (working hours minus break window, minus
  already-booked times) unit-tested in isolation — confirmed break-window
  slots are correctly excluded and boundary slots (last one before close,
  first one after break) are correctly included.
- **Next.js 16 `middleware` → `proxy` migration** applied (Next 16 renamed
  the file/convention) so the admin route guard isn't silently skipped.
- Fonts self-hosted so the build never depends on reaching Google Fonts.

**Important caveat — please run this yourself once:** this sandbox's
network cannot reach Prisma's binary CDN (`binaries.prisma.sh`), so
`npx prisma generate` could not fully complete here, and by extension a full
`npm run build`/`npm run dev` against a live database could not be run
end-to-end inside this environment. This is a network restriction specific
to this sandbox, not a problem with your setup — on your machine, step 4
above (`npx prisma generate && npx prisma migrate dev --name init`) will
complete normally and the two remaining type errors you'd otherwise see
(`AppointmentStatus`, `Prisma.AppointmentWhereInput` not exported) will
disappear, since those types are generated directly from `schema.prisma`.
Please run through the booking flow and the admin flow once after your
first `npm install` to confirm end-to-end before going live — the schema,
constraints and business logic have been verified directly against
Postgres as described above, but I could not click through the actual
rendered pages myself in this sandbox.

## 7. Information I still need from you

Everywhere one of these is missing, the site shows `[TO BE PROVIDED]` or a
clearly-labeled placeholder rather than invented content:

- **Exact official wording** of the RCSEd qualification (MOrth RCSEd vs
  MFDS RCSEd, or both, exactly as printed on the certificate)
- Doctor's short biography text
- Graduation year / degree title from Tanta University (not invented)
- His role/department/dates at Kafr El-Zayat Hospital
- Full addresses and Google Maps links for all 4 clinics
- Clinic name for Mokattam, Zayed, and Tanta (Kafr El-Zayat's is set to
  "Masters Dental Clinic" per your brief)
- Real working hours per clinic (placeholder: 10:00–18:00, break
  14:00–15:00, 30-min slots — editable in the admin dashboard any time)
- Any service prices you want displayed (currently left blank — optional)
- Real patient testimonials (none are seeded; add them from **Admin →
  Testimonials**)
- Email address / social media links, if you want them on the site
- A production `AUTH_SECRET` and a real admin password before deploying
  (change `ADMIN_PASSWORD` in `.env` before your first `npm run db:seed` in
  production, and rotate `AUTH_SECRET`)

## 8. Deploying

Any Node.js host that supports Next.js works (Vercel, Railway, a VPS, etc.).
At minimum, set `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`,
`ADMIN_PASSWORD`, and `NEXT_PUBLIC_SITE_URL` in your host's environment
variables, run `npx prisma migrate deploy` once against the production
database, then `npm run db:seed` once to create the doctor/locations/
services/admin user (safe to re-run — it upserts).
