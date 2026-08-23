import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { apiError, ApiError, requireUser } from "@/lib/api/guards";

export const runtime = "nodejs";

const ALLOWED = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/webp", ".webp"],
]);
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * POST /api/account/avatar
 * Uploads the signed-in user's avatar to the public media bucket
 * (storage RLS restricts users to the avatars/ folder) and stores the
 * public URL on their profile.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!isSupabaseConfigured()) {
      throw new ApiError(503, "Supabase is not configured on this deployment");
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const ext = ALLOWED.get(file.type);
    if (!ext) {
      return NextResponse.json(
        { error: "Avatars must be PNG, JPEG or WebP" },
        { status: 415 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Avatar must be 2MB or smaller" },
        { status: 413 }
      );
    }

    // User-scoped client → storage RLS applies (avatars/ folder only)
    const supabase = await createClient();
    const path = `avatars/${user.id}${ext}`;
    const { error: upError } = await supabase.storage
      .from("media")
      .upload(path, new Uint8Array(await file.arrayBuffer()), {
        contentType: file.type,
        upsert: true,
      });
    if (upError) {
      return NextResponse.json(
        { error: `Avatar upload failed: ${upError.message}` },
        { status: 500 }
      );
    }

    const publicUrl = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;

    const admin = createAdminClient();
    await admin
      .from("profiles")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    return NextResponse.json({ data: { url: publicUrl } }, { status: 201 });
  } catch (err) {
    return apiError(err);
  }
}
