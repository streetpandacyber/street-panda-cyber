import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
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
    const supabase = createClient();
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

/** Throws unless the request is from an authenticated admin. */
export async function requireAdmin(): Promise<{ user: User; profile: Profile }> {
  if (!isSupabaseConfigured()) {
    throw new ApiError(503, "Supabase is not configured on this deployment");
  }
  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (!profile?.is_admin) throw new ApiError(403, "Admin access required");
  return { user, profile };
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
