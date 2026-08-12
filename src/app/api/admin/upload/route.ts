import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, requireAdmin } from "@/lib/api/guards";

export const runtime = "nodejs";

const IMAGE_TYPES = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

const FILE_TYPES = new Map([
  ["application/zip", ".zip"],
  ["application/x-zip-compressed", ".zip"],
  ["application/pdf", ".pdf"],
  ["application/msword", ".doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"],
  ["application/vnd.ms-excel", ".xls"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ".xlsx"],
  ["application/vnd.ms-powerpoint", ".ppt"],
  ["application/vnd.openxmlformats-officedocument.presentationml.presentation", ".pptx"],
  ["text/plain", ".txt"],
  ["text/csv", ".csv"],
]);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_FILE_BYTES = 200 * 1024 * 1024; // 200 MB

/**
 * POST /api/admin/upload
 * Multipart upload → Supabase Storage.
 * `type=image` goes to the public "media" bucket; anything else to the
 * private "products" bucket (digital files).
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const form = await request.formData();
    const file = form.get("file");
    const kind = (form.get("type") as string) ?? "file";

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isImage = kind === "image" || file.type.startsWith("image/");
    const extMap = isImage ? IMAGE_TYPES : FILE_TYPES;
    const ext = extMap.get(file.type);

    if (!ext) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type || "unknown"}` },
        { status: 415 }
      );
    }
    const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_FILE_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File too large (max ${Math.round(maxBytes / 1024 / 1024)} MB)` },
        { status: 413 }
      );
    }

    const bucket = isImage ? "media" : "products";
    const safeName = `${Date.now()}-${nanoid(8)}${ext}`;
    const path = isImage ? `uploads/${safeName}` : `files/${safeName}`;

    const supabase = createAdminClient();
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, new Uint8Array(await file.arrayBuffer()), {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    const url = isImage
      ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
      : path; // private files are delivered via signed URLs

    return NextResponse.json(
      { data: { bucket, path, url, size: file.size, type: file.type } },
      { status: 201 }
    );
  } catch (err) {
    return apiError(err);
  }
}
