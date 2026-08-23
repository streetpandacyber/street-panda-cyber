"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { slugify } from "@/lib/utils";

type ActionResult = { error?: string; data?: unknown };

async function assertAdmin(): Promise<true | ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured on this deployment." };
  }
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Authentication required." };
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", data.user.id)
    .single();
  if (!profile?.is_admin) return { error: "Admin access required." };
  return true;
}

export async function createProductAction(formData: FormData): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (guard !== true) return guard;

  const parseList = (key: string) =>
    String(formData.get(key) ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

  const title = String(formData.get("title") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  if (title.length < 3 || price <= 0) {
    return { error: "A title and a positive price are required." };
  }

  const payload = {
    title,
    slug: slugify(String(formData.get("slug") ?? "") || title),
    description: String(formData.get("description") ?? ""),
    short_description: String(formData.get("short_description") ?? ""),
    category_id: String(formData.get("category_id") ?? "") || null,
    price,
    sale_price: formData.get("sale_price")
      ? Number(formData.get("sale_price"))
      : null,
    thumbnail_url: String(formData.get("thumbnail_url") ?? "") || null,
    file_url: String(formData.get("file_url") ?? "") || null,
    file_size: String(formData.get("file_size") ?? "") || null,
    file_format: String(formData.get("file_format") ?? "") || null,
    tags: String(formData.get("tags") ?? "")
      ? String(formData.get("tags")).split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    features: parseList("features"),
    what_is_included: parseList("what_is_included"),
    is_featured: formData.get("is_featured") === "on",
    is_best_seller: formData.get("is_best_seller") === "on",
    is_published: formData.get("is_published") !== "off",
  };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { data };
}

export async function updateProductAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (guard !== true) return guard;

  const updates: Record<string, unknown> = {};
  for (const key of [
    "title",
    "slug",
    "description",
    "short_description",
    "category_id",
    "thumbnail_url",
    "file_url",
    "file_size",
    "file_format",
  ]) {
    const v = formData.get(key);
    if (v !== null) updates[key] = String(v);
  }
  if (formData.get("price")) updates.price = Number(formData.get("price"));
  if (formData.get("sale_price"))
    updates.sale_price = Number(formData.get("sale_price"));
  updates.is_featured = formData.get("is_featured") === "on";
  updates.is_best_seller = formData.get("is_best_seller") === "on";
  if (formData.get("is_published"))
    updates.is_published = formData.get("is_published") === "on";

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { data };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (guard !== true) return guard;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("products")
    .update({ is_published: false, is_featured: false, is_best_seller: false })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { data: { deleted: true } };
}

export async function togglePublishAction(id: string): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (guard !== true) return guard;

  const supabase = createAdminClient();
  const { data: product } = await supabase
    .from("products")
    .select("is_published")
    .eq("id", id)
    .single();
  if (!product) return { error: "Product not found." };

  const { error } = await supabase
    .from("products")
    .update({ is_published: !product.is_published })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { data: { is_published: !product.is_published } };
}
