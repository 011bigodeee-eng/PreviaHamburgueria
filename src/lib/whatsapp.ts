/** Builds a handoff URL only; it never sends or confirms an order. */
export function whatsappUrl(number: string, message: string) {
  return /^\d{10,15}$/.test(number)
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : null;
}
