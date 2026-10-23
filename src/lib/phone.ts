/**
 * Digits for a wa.me link. A number typed in Egyptian local format
 * (010...) gets the 20 country code; "+" and "00" prefixes are respected.
 * Assumes a single leading 0 means Egypt, which fits this market.
 */
export function toWhatsAppDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `20${digits.slice(1)}`;
  return digits;
}