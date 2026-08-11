import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Eye } from "lucide-react";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/data/service";
import { formatDate } from "@/lib/utils";

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.meta_title ?? post.title,
    description: post.meta_description ?? post.excerpt ?? undefined,
    openGraph: post.cover_image_url
      ? { images: [{ url: post.cover_image_url }] }
      : undefined,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) notFound();

  const allPosts = await getBlogPosts();
  const related = allPosts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <article className="bg-white">
      <div className="container-custom max-w-4xl py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" /> All articles
        </Link>

        {post.category && (
          <span className="badge-orange mt-6 inline-flex">{post.category}</span>
        )}
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-navy-800 md:text-5xl">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-4 text-lg leading-relaxed text-gray-500">{post.excerpt}</p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          {post.published_at && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {formatDate(post.published_at)}
            </span>
          )}
          {post.read_time && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {post.read_time} min read
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" /> {post.view_count.toLocaleString()} views
          </span>
        </div>

        {post.cover_image_url && (
          <div className="relative mt-8 aspect-[16/8] overflow-hidden rounded-3xl bg-gray-100 shadow-soft-md">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        )}

        {/* Article body (rich content from the CMS/database) */}
        {post.content && (
          <div
            className="prose prose-lg mt-10 max-w-none prose-headings:font-extrabold prose-headings:text-navy-800 prose-p:leading-relaxed prose-p:text-gray-600 prose-a:text-orange-600 prose-strong:text-navy-800"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="badge-navy">#{tag}</span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="hero-gradient mt-12 rounded-3xl p-8 text-center text-white md:p-10">
          <h2 className="text-2xl font-extrabold">
            Ready to put this into action? 🚀
          </h2>
          <p className="mx-auto mt-2 max-w-md text-white/70">
            Grab the tools and templates used by 10,000+ Kenyan creators.
          </p>
          <Link href="/marketplace" className="btn-primary mt-6">
            Browse the Marketplace
          </Link>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-custom">
            <h2 className="section-title">Keep Reading</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="card-premium group flex items-center gap-4 p-5"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                    {p.cover_image_url && (
                      <Image src={p.cover_image_url} alt={p.title} fill sizes="80px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 font-bold leading-snug text-navy-800 group-hover:text-orange-600">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {p.read_time ? `${p.read_time} min read` : "Quick read"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
