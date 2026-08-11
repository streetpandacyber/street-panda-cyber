import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");

  // Public routes — no auth checks needed
  if (!isDashboard && !isAdmin) {
    return response;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  // When Supabase is not configured yet, let the pages themselves render
  // their friendly "configure your project" states.
  if (!url.startsWith("https://") || anonKey.startsWith("your_")) {
    return response;
  }

  try {
    // Re-check the session with access to this request's cookies
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        // read-only check in middleware — writes are handled by updateSession
        set: () => {},
        remove: () => {},
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Protect dashboard routes — redirect guests to login
    if (isDashboard && !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Protect admin routes — require an authenticated user.
    // (Admin role itself is verified inside the admin pages/profile check.)
    if (isAdmin && !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  } catch {
    // Never break the site on auth-network hiccups
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api/mpesa/callback).*)",
  ],
};
