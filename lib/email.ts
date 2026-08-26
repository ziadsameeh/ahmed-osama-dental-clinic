import { Resend } from "resend";

type AppointmentEmailData = {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  manageToken: string;
  patient: { fullName: string; phone: string; email: string | null };
  location: { name: string };
  service: { name: string };
};

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL ?? "Dr. Ahmed Osama Sameeh <onboarding@resend.dev>";
}

function getAdminNotificationEmail() {
  return process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL ?? null;
}

async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const resend = getResend();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipped email "${opts.subject}" to ${opts.to}`);
    return;
  }
  try {
    await resend.emails.send({
      from: getFromAddress(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  } catch (err) {
    console.error("[email] failed to send", err);
  }
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function baseTemplate(bodyHtml: string) {
  return `
  <div style="font-family: -apple-system, Segoe UI, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #2b1d14;">
    <p style="text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; color: #9c7a4f; margin-bottom: 4px;">
      Dr. Ahmed Osama Sameeh — Orthodontist
    </p>
    ${bodyHtml}
    <p style="margin-top: 32px; font-size: 12px; color: #9c8a78;">
      Mokattam · Sheikh Zayed · Kafr El-Zayat · Tanta — 01092728428
    </p>
  </div>`;
}

export async function sendPatientBookingConfirmation(appt: AppointmentEmailData) {
  if (!appt.patient.email) return;
  const manageUrl = `${getSiteUrl()}/manage/${appt.manageToken}`;

  const html = baseTemplate(`
    <h2 style="font-size: 20px; margin: 8px 0;">Your appointment request was received</h2>
    <p>Hi ${appt.patient.fullName}, here are your appointment details:</p>
    <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding:6px 0; color:#6b4a32;">Service</td><td style="padding:6px 0; text-align:right;"><strong>${appt.service.name}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">Location</td><td style="padding:6px 0; text-align:right;"><strong>${appt.location.name}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">Date</td><td style="padding:6px 0; text-align:right;"><strong>${formatDate(appt.appointmentDate)}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">Time</td><td style="padding:6px 0; text-align:right;"><strong>${appt.appointmentTime}</strong></td></tr>
    </table>
    <p>Your appointment is <strong>pending confirmation</strong> — we'll confirm it shortly.</p>
    <p style="margin-top: 20px;">
      <a href="${manageUrl}" style="display:inline-block; background:#2b1d14; color:#fdfbf7; padding:10px 20px; border-radius:999px; text-decoration:none; font-size:14px;">
        View or reschedule this appointment
      </a>
    </p>
  `);

  await sendEmail({
    to: appt.patient.email,
    subject: "Your appointment request — Dr. Ahmed Osama Sameeh",
    html,
  });
}

export async function sendAdminNewBookingNotification(appt: AppointmentEmailData) {
  const to = getAdminNotificationEmail();
  if (!to) return;

  const adminUrl = `${getSiteUrl()}/admin/appointments?highlight=${appt.id}`;

  const html = baseTemplate(`
    <h2 style="font-size: 20px; margin: 8px 0;">New appointment request</h2>
    <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding:6px 0; color:#6b4a32;">Patient</td><td style="padding:6px 0; text-align:right;"><strong>${appt.patient.fullName}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">Phone</td><td style="padding:6px 0; text-align:right;"><strong>${appt.patient.phone}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">Service</td><td style="padding:6px 0; text-align:right;"><strong>${appt.service.name}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">Location</td><td style="padding:6px 0; text-align:right;"><strong>${appt.location.name}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">Date</td><td style="padding:6px 0; text-align:right;"><strong>${formatDate(appt.appointmentDate)}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">Time</td><td style="padding:6px 0; text-align:right;"><strong>${appt.appointmentTime}</strong></td></tr>
    </table>
    <p style="margin-top: 20px;">
      <a href="${adminUrl}" style="display:inline-block; background:#2b1d14; color:#fdfbf7; padding:10px 20px; border-radius:999px; text-decoration:none; font-size:14px;">
        Open in admin dashboard
      </a>
    </p>
  `);

  await sendEmail({
    to,
    subject: `New booking: ${appt.patient.fullName} — ${formatDate(appt.appointmentDate)}`,
    html,
  });
}

export async function sendAdminAppointmentConfirmed(appt: AppointmentEmailData) {
  const to = getAdminNotificationEmail();
  if (!to) return;

  const adminUrl = `${getSiteUrl()}/admin/appointments?highlight=${appt.id}`;

  const html = baseTemplate(`
    <h2 style="font-size: 20px; margin: 8px 0;">Appointment confirmed</h2>
    <p>The following appointment has been confirmed:</p>
    <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding:6px 0; color:#6b4a32;">Patient</td><td style="padding:6px 0; text-align:right;"><strong>${appt.patient.fullName}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">Phone</td><td style="padding:6px 0; text-align:right;"><strong>${appt.patient.phone}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">Service</td><td style="padding:6px 0; text-align:right;"><strong>${appt.service.name}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">Location</td><td style="padding:6px 0; text-align:right;"><strong>${appt.location.name}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">Date</td><td style="padding:6px 0; text-align:right;"><strong>${formatDate(appt.appointmentDate)}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">Time</td><td style="padding:6px 0; text-align:right;"><strong>${appt.appointmentTime}</strong></td></tr>
    </table>
    <p style="margin-top: 20px;">
      <a href="${adminUrl}" style="display:inline-block; background:#2b1d14; color:#fdfbf7; padding:10px 20px; border-radius:999px; text-decoration:none; font-size:14px;">
        Open in admin dashboard
      </a>
    </p>
  `);

  await sendEmail({
    to,
    subject: `Appointment confirmed: ${appt.patient.fullName} — ${formatDate(appt.appointmentDate)}`,
    html,
  });
}

export async function sendPatientRescheduleReceived(appt: AppointmentEmailData) {
  if (!appt.patient.email) return;

  const manageUrl = `${getSiteUrl()}/manage/${appt.manageToken}`;

  const html = baseTemplate(`
    <h2 style="font-size: 20px; margin: 8px 0;">Your new time was requested</h2>
    <p>Hi ${appt.patient.fullName}, we received your request for a new appointment time:</p>
    <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding:6px 0; color:#6b4a32;">Date</td><td style="padding:6px 0; text-align:right;"><strong>${formatDate(appt.appointmentDate)}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">Time</td><td style="padding:6px 0; text-align:right;"><strong>${appt.appointmentTime}</strong></td></tr>
    </table>
    <p>It's now <strong>pending confirmation</strong> from the clinic.</p>
    <p style="margin-top: 20px;">
      <a href="${manageUrl}" style="display:inline-block; background:#2b1d14; color:#fdfbf7; padding:10px 20px; border-radius:999px; text-decoration:none; font-size:14px;">
        View this appointment
      </a>
    </p>
  `);

  await sendEmail({
    to: appt.patient.email,
    subject: "New appointment time requested",
    html,
  });
}

export async function sendPatientAppointmentConfirmed(appt: AppointmentEmailData) {
  if (!appt.patient.email) return;

  const manageUrl = `${getSiteUrl()}/manage/${appt.manageToken}`;

  const html = baseTemplate(`
    <h2 style="font-size: 20px; margin: 8px 0;">Your appointment is confirmed ✓</h2>
    <p>Hi ${appt.patient.fullName}, your appointment is confirmed:</p>
    <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding:6px 0; color:#6b4a32;">Service</td><td style="padding:6px 0; text-align:right;"><strong>${appt.service.name}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">Location</td><td style="padding:6px 0; text-align:right;"><strong>${appt.location.name}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">Date</td><td style="padding:6px 0; text-align:right;"><strong>${formatDate(appt.appointmentDate)}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">Time</td><td style="padding:6px 0; text-align:right;"><strong>${appt.appointmentTime}</strong></td></tr>
    </table>
    <p>We look forward to seeing you. Need to change it?</p>
    <p style="margin-top: 20px;">
      <a href="${manageUrl}" style="display:inline-block; background:#2b1d14; color:#fdfbf7; padding:10px 20px; border-radius:999px; text-decoration:none; font-size:14px;">
        View or reschedule this appointment
      </a>
    </p>
  `);

  await sendEmail({
    to: appt.patient.email,
    subject: "Your appointment is confirmed",
    html,
  });
}

export async function sendAdminRescheduleNotification(appt: AppointmentEmailData) {
  const to = getAdminNotificationEmail();
  if (!to) return;

  const adminUrl = `${getSiteUrl()}/admin/appointments?highlight=${appt.id}`;

  const html = baseTemplate(`
    <h2 style="font-size: 20px; margin: 8px 0;">Patient requested a new time</h2>
    <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding:6px 0; color:#6b4a32;">Patient</td><td style="padding:6px 0; text-align:right;"><strong>${appt.patient.fullName}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">Phone</td><td style="padding:6px 0; text-align:right;"><strong>${appt.patient.phone}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">New date</td><td style="padding:6px 0; text-align:right;"><strong>${formatDate(appt.appointmentDate)}</strong></td></tr>
      <tr><td style="padding:6px 0; color:#6b4a32;">New time</td><td style="padding:6px 0; text-align:right;"><strong>${appt.appointmentTime}</strong></td></tr>
    </table>
    <p style="margin-top: 20px;">
      <a href="${adminUrl}" style="display:inline-block; background:#2b1d14; color:#fdfbf7; padding:10px 20px; border-radius:999px; text-decoration:none; font-size:14px;">
        Review and confirm
      </a>
    </p>
  `);

  await sendEmail({
    to,
    subject: `Reschedule request: ${appt.patient.fullName}`,
    html,
  });
}