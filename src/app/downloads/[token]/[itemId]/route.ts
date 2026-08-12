/**
 * Public download gateway under /downloads/… — same secure handler as the
 * /api/… route (token + expiry + limit validation, signed Storage URL,
 * counter increments and audit logging).
 */
export { GET } from "@/app/api/downloads/[token]/[itemId]/route";

export const runtime = "nodejs";
