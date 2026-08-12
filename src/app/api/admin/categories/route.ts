import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCategoriesWithCounts } from "@/lib/data/service";
import { apiError, requireAdmin } from "@/lib/api/guards";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  is_featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

/** GET /api/admin/categories — categories with product counts. */
export async function GET() {
  try {
    await requireAdmin();
    const data = await getCategoriesWithCounts();
    return NextResponse.json({ data });
  } catch (err) {
    return apiError(err);
  }
}

/** POST /api/admin/categories — create. */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid category payload" }, { status: 400 });
    }
    const supabase = createAdminClient();
    const body = parsed.data;
    const { data, error } = await supabase
      .from("categories")
      .insert({
        ...body,
        slug: body.slug ?? body.name.toLowerCase().replace(/[^\w]+/g, "-"),
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return apiError(err);
  }
}

/** PUT /api/admin/categories?id=… — update. */
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const parsed = schema.partial().safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single();
    if (error || !data) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    return NextResponse.json({ data });
  } catch (err) {
    return apiError(err);
  }
}

/** DELETE /api/admin/categories?id=… */
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const supabase = createAdminClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
