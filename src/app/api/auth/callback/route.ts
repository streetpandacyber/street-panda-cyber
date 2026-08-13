import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export const runtime = "nodejs";

/**
 * GET /api/auth/callback?code=…&next=/dashboard
 * Exchanges the OAuth / email-link code for a session, then redirects.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/dashboard";

  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (errorParam || !code || !isSupabaseConfigured()) {
    const url = new URL(errorParam ? "/login" : safeNext, request.url);
    if (errorParam) url.searchParams.set("error", errorParam);
    return NextResponse.redirect(url);
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const url = new URL("/login", request.url);
      url.searchParams.set("error", error.message);
      return NextResponse.redirect(url);
    }
  } catch (err) {
    console.error("[auth/callback] exchange failed", err);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.redirect(new URL(safeNext, request.url));
}
