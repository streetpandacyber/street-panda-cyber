"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { BlogPost } from "@/types";
import { PostEditor } from "@/components/admin/PostEditor";
import { PageHeader } from "@/components/admin/ui";

export default function EditBlogPostPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/blog?limit=100`);
        const data = await res.json();
        const found = (data.data ?? []).find((p: BlogPost) => p.id === params.id);
        setPost(found ?? null);
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="animate-pulse text-3xl">⏳</span>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Blog Post"
        subtitle={post ? `Editing “${post.title}”` : "Post not found (demo mode saves are session-only)"}
      />
      <div className="mt-6">
        <PostEditor initial={post} editId={post?.id} />
      </div>
    </div>
  );
}
