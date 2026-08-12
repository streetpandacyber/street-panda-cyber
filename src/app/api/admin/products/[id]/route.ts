import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, ApiError, requireAdmin } from "@/lib/api/guards";

export const runtime = "nodejs";

interface RouteContext {
  params: { id: string };
}

/** GET /api/admin/products/[id] — single product for editing. */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("id", params.id)
      .single();
    if (error || !data) throw new ApiError(404, "Product not found");
    return NextResponse.json({ data });
  } catch (err) {
    return apiError(err);
  }
}

/** PUT /api/admin/products/[id] — update a product. */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    const body = await request.json();

    const allowed = {
      title: body.title,
      slug: body.slug,
      description: body.description,
      short_description: body.short_description,
      category_id: body.category_id,
      price: body.price,
      sale_price: body.sale_price,
      thumbnail_url: body.thumbnail_url,
      gallery_urls: body.gallery_urls,
      preview_urls: body.preview_urls,
      file_url: body.file_url,
      file_size: body.file_size,
      file_format: body.file_format,
      tags: body.tags,
      features: body.features,
      what_is_included: body.what_is_included,
      is_featured: body.is_featured,
      is_best_seller: body.is_best_seller,
      is_new: body.is_new,
      is_published: body.is_published,
      meta_title: body.meta_title,
      meta_description: body.meta_description,
    };
    const cleaned = Object.fromEntries(
      Object.entries(allowed).filter(([, v]) => v !== undefined)
    );

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .update(cleaned)
      .eq("id", params.id)
      .select()
      .single();
    if (error || !data) throw new ApiError(404, "Product not found");
    return NextResponse.json({ data });
  } catch (err) {
    return apiError(err);
  }
}

/** DELETE /api/admin/products/[id] — soft delete (unpublish). */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("products")
      .update({ is_published: false, is_featured: false, is_best_seller: false })
      .eq("id", params.id);
    if (error) throw new ApiError(500, "Could not delete product");
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
