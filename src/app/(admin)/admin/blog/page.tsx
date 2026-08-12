"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, Pencil, PlusCircle, Trash2 } from "lucide-react";
import type { BlogPost } from "@/types";
import { formatDate } from "@/lib/utils";
import { Card, PageHeader, StatusPill } from "@/components/admin/ui";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog?limit=50");
      const data = await res.json();
      setPosts(data.data ?? []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const remove = async (p: BlogPost) => {
    await fetch(`/api/admin/blog?id=${p.id}`, { method: "DELETE" });
    toast.success(`Deleted “${p.title}”`);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog Posts"
        subtitle="Create, edit and publish Learning Hub articles"
        action={
          <Link href="/admin/blog/new" className="btn-primary">
            <PlusCircle className="h-4 w-4" /> New Post
          </Link>
        }
      />

      <Card className="!p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40">
                <th className="px-5 py-4 font-semibold">Post</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Views</th>
                <th className="px-5 py-4 font-semibold">Published</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-white/40">Loading posts…</td></tr>
              ) : (
                posts.map((p) => (
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
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <StatusPill status={p.is_published ? "published" : "draft"} />
                        {p.is_featured && (
                          <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold text-orange-300">Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-white/60">{p.view_count.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-white/50">
                      {p.published_at ? formatDate(p.published_at) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <Link href={`/admin/blog/${p.id}/edit`} className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <Link href={`/blog/${p.slug}`} className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white" title="View">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button onClick={() => remove(p)} className="rounded-lg p-2 text-white/40 hover:bg-red-500/20 hover:text-red-300" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
