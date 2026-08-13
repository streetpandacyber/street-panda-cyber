import Link from "next/link";
import { BookOpen, Eye } from "lucide-react";
import { getBlogPosts } from "@/lib/data/service";
import { Card, PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminLearningHubPage() {
  const posts = await getBlogPosts();
  const categories = Array.from(new Set(posts.map((p) => p.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Hub"
        subtitle="Free educational content driving organic traffic"
        action={
          <Link href="/learning-hub" className="btn-secondary !py-2.5 text-sm">
            View public hub →
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((cat) => {
          const inCat = posts.filter((p) => p.category === cat);
          const views = inCat.reduce((s, p) => s + p.view_count, 0);
          return (
            <Card key={cat}>
              <BookOpen className="h-5 w-5 text-orange-300" />
              <p className="mt-3 font-bold text-white">{cat}</p>
              <p className="mt-1 text-xs text-white/40">
                {inCat.length} article{inCat.length === 1 ? "" : "s"} • {views.toLocaleString()} views
              </p>
            </Card>
          );
        })}
      </div>

      <Card className="!p-0">
        <ul className="divide-y divide-white/5">
          {posts.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-semibold text-white">{p.title}</p>
                <p className="text-xs text-white/40">{p.category} • {p.view_count.toLocaleString()} views</p>
              </div>
              <Link href={`/blog/${p.slug}`} className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white" title="View article">
                <Eye className="h-4 w-4" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
