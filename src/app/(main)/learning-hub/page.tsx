import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Eye } from "lucide-react";
import { getBlogPosts } from "@/lib/data/service";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Learning Hub — Free Guides & Tutorials",
  description:
    "Free practical guides on AI, design, business and education — written for Kenyan creators, students and entrepreneurs.",
};

export const dynamic = "force-dynamic";

export default async function LearningHubPage() {
  const posts = await getBlogPosts();
  const categories = Array.from(new Set(posts.map((p) => p.category).filter(Boolean)));
  const featured = posts.filter((p) => p.is_featured);
  const rest = posts.filter((p) => !p.is_featured);

  return (
    <div>
      {/* Header */}
      <section className="hero-gradient relative overflow-hidden py-20 text-center text-white">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-orange-500/25 blur-[100px]" />
        <div className="container-custom relative">
          <span className="badge inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold">
            📖 Learning Hub
          </span>
          <h1 className="mt-5 text-4xl font-extrabold md:text-5xl">
            Learn Faster. <span className="text-gradient-orange">Grow Smarter.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            Free guides, tutorials and playbooks on AI, design, business and
            education — fresh every week.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <h2 className="section-title">✨ Featured Articles</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {featured.map((post) => (
              <article
                key={post.id}
                className="card-premium group flex h-full flex-col overflow-hidden"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="relative block aspect-[16/9] overflow-hidden bg-gray-100"
                >
                  {post.cover_image_url && (
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  {post.category && (
                    <span className="absolute left-3 top-3 badge-orange">{post.category}</span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {post.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {formatDate(post.published_at)}
                      </span>
                    )}
                    {post.read_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {post.read_time} min
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> {post.view_count.toLocaleString()}
                    </span>
                  </div>
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="mt-3 line-clamp-2 text-lg font-bold text-navy-800 group-hover:text-orange-600">
                      {post.title}
                    </h3>
                  </Link>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-500">
                      {post.excerpt}
                    </p>
                  )}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-600"
                  >
                    Read Article <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* All posts */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <h2 className="section-title">All Articles</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...rest, ...featured].map((post) => (
              <Link
                key={post.id + "-all"}
                href={`/blog/${post.slug}`}
                className="card-premium group flex items-center gap-4 p-5"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                  {post.cover_image_url && (
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  {post.category && (
                    <span className="text-xs font-bold uppercase tracking-wide text-orange-600">
                      {post.category}
                    </span>
                  )}
                  <h3 className="mt-0.5 line-clamp-2 font-bold leading-snug text-navy-800 group-hover:text-orange-600">
                    {post.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {post.read_time ? `${post.read_time} min read` : "Quick read"} •{" "}
                    {post.view_count.toLocaleString()} views
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
