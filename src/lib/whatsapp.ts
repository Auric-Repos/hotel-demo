import { SITE_CONFIG } from "@/lib/constants";

/**
 * Builds a wa.me link. Reuse it anywhere (floating button, booking confirmation,
 * contact page, dashboard "Message guest" button).
 * Pass a phone number to message a guest; omit it to message the hotel.
 */
export function getWhatsAppUrl(message?: string, phone: string = SITE_CONFIG.whatsappNumber) {
  const digits = phone.replace(/\D/g, ""); // wa.me needs digits only, with country code
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}
