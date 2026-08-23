import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isDemoAdminAllowed,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/env";
import { DataUnavailableError } from "@/lib/data/service";
import type { Profile } from "@/types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiError(err: unknown) {
  if (err instanceof DataUnavailableError) {
    return NextResponse.json(
      { error: err.message },
      { status: 503, headers: { "Retry-After": "60" } }
    );
  }
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[api] unexpected error", err);
  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 }
  );
}

/** Returns the authenticated user (from the request's Supabase session) or null. */
export async function getAuthUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<User> {
  const user = await getAuthUser();
  if (!user) throw new ApiError(401, "Authentication required");
  return user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return (data as Profile) ?? null;
}

/** Throws unless the request is from an authenticated admin.
 *  When Supabase is not configured, returns a demo admin so the panel
 *  remains explorable with sample data. */
export async function requireAdmin(): Promise<{
  user: User | null;
  profile: Profile;
  demo: boolean;
}> {
  if (!isSupabaseConfigured()) {
    if (!isDemoAdminAllowed()) {
      throw new ApiError(
        503,
        "Admin access is unavailable until Supabase is configured."
      );
    }

    return {
      user: null,
      demo: true,
      profile: {
        id: "demo",
        email: "admin@jmmajiwa.com",
        full_name: "Demo Admin",
        country: "Kenya",
        is_admin: true,
        newsletter_subscribed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }

  if (!isSupabaseAdminConfigured()) {
    throw new ApiError(
      503,
      "Admin access requires the Supabase service-role key."
    );
  }

  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (!profile?.is_admin) throw new ApiError(403, "Admin access required");
  return { user, profile, demo: false };
}

/* ── Pagination helpers ─────────────────────────────── */

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10) || 12)
  );
  return { page, limit, offset: (page - 1) * limit };
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

/** Cache headers for public GET endpoints (edge/CDN caching). */
export const PUBLIC_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};
