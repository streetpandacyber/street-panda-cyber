import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react";
import { getBlogPosts } from "@/lib/data/service";
import { formatDate } from "@/lib/utils";
import { Card, PageHeader, StatusPill } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminBlogPostsPage() {
  const posts = await getBlogPosts();

  return (
    <div className="space-y-6">
      <PageHeader title="Blog Posts" subtitle={`${posts.length} articles in the Learning Hub`} />

      <Card className="!p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40">
                <th className="px-5 py-4 font-semibold">Article</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Views</th>
                <th className="px-5 py-4 font-semibold">Read time</th>
                <th className="px-5 py-4 font-semibold">Published</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-white/10">
                        {p.cover_image_url && (
                          <Image src={p.cover_image_url} alt={p.title} fill sizes="64px" className="object-cover" />
                        )}
                      </div>
                      <span className="line-clamp-1 max-w-[280px] font-semibold text-white">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-white/60">{p.category}</td>
                  <td className="px-5 py-3.5 text-white/60">{p.view_count.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-white/60">{p.read_time} min</td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={p.is_published ? "published" : "draft"} />
                    {p.is_featured && (
                      <span className="ml-1 rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold text-orange-300">Featured</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link href={`/blog/${p.slug}`} className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white" title="View">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <span className="text-[10px] text-white/30">{p.published_at ? formatDate(p.published_at) : "—"}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-xs text-white/30">
        Content is managed in the blog_posts table (or supabase/seed.sql for the demo dataset).
      </p>
    </div>
  );
}
