# Verification scripts (not part of the application)

These two files were used only to verify the database design and business
rules against a real PostgreSQL instance while building this project, in a
sandbox where `npx prisma generate`/`migrate` could not reach Prisma's
binary CDN (`binaries.prisma.sh`) to download the schema engine.

- `schema_mirror.sql` — a hand-written SQL mirror of `prisma/schema.prisma`
  (trimmed to the fields needed for the tests below).
- `test_data_and_matrix.sql` — seeds the real 4 locations with their exact
  weekly schedules and verifies, directly in Postgres:
  - Mokattam & Zayed are open every day except Thursday.
  - Kafr El-Zayat & Tanta are open only Wednesday and Thursday.
  - The `UNIQUE(locationId, appointmentDate, appointmentTime)` constraint
    rejects a second appointment in an already-booked slot (double-booking
    prevention).

You do **not** need to run these. On your machine, `npx prisma migrate dev`
will generate and apply the real migration from `schema.prisma` normally.
They're kept here only as a record of what was tested and how.
