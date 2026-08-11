import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { getBlogPosts } from "@/lib/data/service";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles on AI, design, business and education from the JM Majiwa team.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center">
          <span className="badge-orange">✍️ Blog</span>
          <h1 className="section-title mt-4">
            Insights & <span className="text-gradient-orange">Ideas</span>
          </h1>
          <p className="section-subtitle mt-4">
            Everything we publish — tutorials, playbooks and honest advice.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="card-premium group flex h-full flex-col overflow-hidden">
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
                      <Clock className="h-3.5 w-3.5" /> {post.read_time} min read
                    </span>
                  )}
                </div>
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="mt-3 line-clamp-2 text-lg font-bold text-navy-800 group-hover:text-orange-600">
                    {post.title}
                  </h2>
                </Link>
                {post.excerpt && (
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-500">{post.excerpt}</p>
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
    </div>
  );
}
