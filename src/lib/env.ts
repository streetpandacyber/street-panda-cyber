/**
 * Runtime environment helpers.
 *
 * The marketplace ships with demo/fallback data so the site works out of the
 * box. Once real Supabase credentials are provided via environment variables,
 * all data access automatically switches to the live database.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return (
    url.startsWith("https://") &&
    url.includes("supabase") &&
    anonKey.length > 20 &&
    !anonKey.startsWith("your_")
  );
}

export function isMpesaConfigured(): boolean {
  const key = process.env.MPESA_CONSUMER_KEY ?? "";
  const secret = process.env.MPESA_CONSUMER_SECRET ?? "";
  return (
    key.length > 0 &&
    !key.startsWith("your_") &&
    secret.length > 0 &&
    !secret.startsWith("your_")
  );
}

export function isResendConfigured(): boolean {
  const key = process.env.RESEND_API_KEY ?? "";
  return key.length > 0 && !key.startsWith("your_");
}

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "JM Majiwa";
