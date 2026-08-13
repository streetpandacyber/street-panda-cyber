import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Refresh the Supabase session (handles token refresh + cookie rotation)
  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  if (!isDashboard && !isAdmin) return response;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  // Before credentials exist, pages render their friendly demo/config states.
  if (!url.startsWith("https://") || anonKey.startsWith("your_")) {
    return response;
  }

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set: () => {},
        remove: () => {},
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // ── /dashboard/* → must be authenticated ──────────────────────
    if (isDashboard && !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // ── /admin/* → must be authenticated AND an admin ─────────────
    if (isAdmin) {
      if (!user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (!profile?.is_admin) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return response;
  } catch {
    // Never take the site down on an auth hiccup
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api/mpesa/callback).*)",
  ],
};
