type Doctor = {
  name: string;
  specialty: string;
  bio?: string | null;
  education?: string | null;
  qualifications?: string | null;
  hospital?: string | null;
} | null;

export default function DoctorIntro({ doctor }: { doctor: Doctor }) {
  const bio = doctor?.bio ?? "[TO BE PROVIDED]";
  const education = doctor?.education ?? "[TO BE PROVIDED]";
  const qualifications = doctor?.qualifications ?? "[TO BE PROVIDED]";
  const hospital = doctor?.hospital ?? "[TO BE PROVIDED]";

  return (
    <section id="doctor" className="mx-auto max-w-6xl px-5 py-20">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-coffee">About the Doctor</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-espresso sm:text-4xl">
            {doctor?.name ?? "Dr. Ahmed Osama Sameeh"}
          </h2>
          <p className="mt-4 text-espresso-soft leading-relaxed">{bio}</p>
        </div>

        <div className="rounded-3xl border border-latte-light bg-warm-white p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-coffee">
            Professional Qualifications
          </p>
          <dl className="mt-5 space-y-5">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-espresso-soft/70">
                Education
              </dt>
              <dd className="mt-1 text-espresso">{education}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-espresso-soft/70">
                RCSEd Qualification
              </dt>
              <dd className="mt-1 text-espresso">{qualifications}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-espresso-soft/70">
                Hospital Affiliation
              </dt>
              <dd className="mt-1 text-espresso">{hospital}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
