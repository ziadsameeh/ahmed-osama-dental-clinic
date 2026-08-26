/**
 * Builds a "click to chat" wa.me link. No WhatsApp Business API needed —
 * this just opens WhatsApp (app or web) with a pre-filled message the
 * person taps "send" on.
 */
export function buildWhatsAppLink(phone: string, message: string) {
  const normalized = normalizeEgyptianPhone(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

/** Converts a local Egyptian number like "01092728428" to "201092728428". */
export function normalizeEgyptianPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("20")) return digits;
  if (digits.startsWith("0")) return `20${digits.slice(1)}`;
  return `20${digits}`;
}

export const CLINIC_WHATSAPP_NUMBER = "01092728428";