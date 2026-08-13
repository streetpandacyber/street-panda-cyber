import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBlogPosts } from "@/lib/data/service";
import { isSupabaseConfigured } from "@/lib/env";
import { apiError, paginated, parsePagination, requireAdmin } from "@/lib/api/guards";

export const runtime = "nodejs";

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  cover_image_url: z.string().optional(),
  author_name: z.string().optional(),
  author_bio: z.string().optional(),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  published_at: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  read_time: z.number().optional(),
});

/** GET /api/admin/blog — list posts (drafts included when live). */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const sp = request.nextUrl.searchParams;
    const { page, limit } = parsePagination(sp);

    if (!isSupabaseConfigured()) {
      const posts = await getBlogPosts();
      return NextResponse.json(paginated(posts, posts.length, page, limit));
    }

    const supabase = createAdminClient();
    const { data, error, count } = await supabase
      .from("blog_posts")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(paginated(data ?? [], count ?? 0, page, limit));
  } catch (err) {
    return apiError(err);
  }
}

/** POST /api/admin/blog — create a post. */
export async function POST(request: NextRequest) {
  try {
    const { demo } = await requireAdmin();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid post payload" }, { status: 400 });
    }
    if (demo) {
      return NextResponse.json({ data: { id: "demo", ...parsed.data } }, { status: 201 });
    }

    const supabase = createAdminClient();
    const body = parsed.data;
    const words = (body.content ?? "").split(/\s+/).filter(Boolean).length;
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        ...body,
        slug: body.slug ?? body.title.toLowerCase().replace(/[^\w]+/g, "-"),
        read_time: body.read_time ?? Math.max(1, Math.round(words / 200)),
        published_at: body.is_published
          ? (body.published_at ?? new Date().toISOString())
          : null,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return apiError(err);
  }
}

/** PUT /api/admin/blog?id=… — update a post. */
export async function PUT(request: NextRequest) {
  try {
    const { demo } = await requireAdmin();
    if (demo) return NextResponse.json({ data: { id: "demo" } });
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const parsed = schema.partial().safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single();
    if (error || !data) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ data });
  } catch (err) {
    return apiError(err);
  }
}

/** DELETE /api/admin/blog?id=… */
export async function DELETE(request: NextRequest) {
  try {
    const { demo } = await requireAdmin();
    if (demo) return NextResponse.json({ success: true });
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const supabase = createAdminClient();
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
