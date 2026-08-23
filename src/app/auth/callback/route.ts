import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /auth/callback?code=…
 * Supabase OAuth / email-confirmation callback. Exchanges the code for a
 * session and redirects to `next` (or the dashboard).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error_description");
  const nextParam = searchParams.get("next") ?? "/dashboard";
  const safeNext =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  if (errorParam || !code) {
    const url = new URL("/login", request.url);
    if (errorParam) url.searchParams.set("error", errorParam);
    return NextResponse.redirect(url);
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const url = new URL("/login", request.url);
      url.searchParams.set("error", error.message);
      return NextResponse.redirect(url);
    }
  } catch (err) {
    console.error("[auth/callback] code exchange failed", err);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.redirect(new URL(safeNext, request.url));
}
