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

export function isSupabaseAdminConfigured(): boolean {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return (
    isSupabaseConfigured() &&
    serviceRoleKey.length > 20 &&
    !serviceRoleKey.startsWith("your_")
  );
}

/** Demo catalog data is allowed only outside production. */
export function isDemoDataAllowed(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    (process.env.ALLOW_DEMO_DATA ?? "true") === "true"
  );
}

export function isDemoAdminAllowed(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.ALLOW_DEMO_ADMIN === "true";
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
  process.env.NEXT_PUBLIC_APP_URL ?? "https://jm-majiwa.vercel.app";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "JM Majiwa";
