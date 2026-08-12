import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Eye, List, MessageCircleHeart } from "lucide-react";
import { getBlogPostBySlug, getBlogPosts, getProducts } from "@/lib/data/service";
import { prepareArticle } from "@/lib/markdown";
import { formatDate, getInitials } from "@/lib/utils";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { PostCard } from "@/components/blog/BlogBrowser";
import { ProductCard } from "@/components/marketplace/ProductCard";

interface BlogPostPageProps {
  params: { slug: string };
}

const CATEGORY_TO_PRODUCT_CAT: Record<string, string> = {
  AI: "ai-prompt-packs",
  ChatGPT: "ai-prompt-packs",
  Canva: "canva-templates",
  Design: "canva-templates",
  Business: "business-templates",
  Kenya: "digital-learning",
  Education: "digital-learning",
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.meta_title ?? post.title,
    description: post.meta_description ?? post.excerpt ?? undefined,
    openGraph: post.cover_image_url ? { images: [{ url: post.cover_image_url }] } : undefined,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) notFound();

  const { html, toc } = prepareArticle(post.content ?? "");
  const [allPosts, allProducts] = await Promise.all([getBlogPosts(), getProducts({})]);

  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .concat(allPosts.filter((p) => p.id !== post.id && p.category !== post.category))
    .slice(0, 3);

  const productCatSlug = CATEGORY_TO_PRODUCT_CAT[post.category ?? ""] ?? "ai-prompt-packs";
  const mentionedProducts = allProducts
    .filter((p) => p.category?.slug === productCatSlug)
    .concat(allProducts.filter((p) => p.category?.slug !== productCatSlug))
    .slice(0, 3);

  return (
    <article className="bg-white">
      {/* hero */}
      <div className="relative">
        <div className="relative h-[320px] w-full overflow-hidden bg-navy-900 md:h-[440px]">
          {post.cover_image_url && (
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-90"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent" />
        </div>
        <div className="container-custom relative -mt-40 md:-mt-56">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur transition-colors hover:bg-white/25"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to blog
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {post.category && <span className="badge-orange">{post.category}</span>}
            {post.read_time && (
              <span className="badge inline-flex items-center gap-1 bg-white/15 text-white backdrop-blur">
                <Clock className="h-3 w-3" /> {post.read_time} min read
              </span>
            )}
            {post.published_at && (
              <span className="badge bg-white/15 text-white backdrop-blur">
                {formatDate(post.published_at)}
              </span>
            )}
            <span className="badge inline-flex items-center gap-1 bg-white/15 text-white backdrop-blur">
              <Eye className="h-3 w-3" /> {post.view_count.toLocaleString()} views
            </span>
          </div>
          <h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight text-white md:text-5xl">
            {post.title}
          </h1>
        </div>
      </div>

      <div className="container-custom max-w-5xl py-12">
        {/* author + share */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-8">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-600 text-sm font-bold text-white">
              {getInitials(post.author_name ?? "JM Majiwa")}
            </span>
            <div>
              <p className="font-bold text-navy-800">{post.author_name ?? "JM Majiwa"}</p>
              <p className="text-xs text-gray-500">
                {post.author_bio ?? "Writing from the JM Majiwa team"}
              </p>
            </div>
          </div>
          <ShareButtons title={post.title} />
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[220px_1fr]">
          {/* TOC */}
          {toc.length > 1 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-3xl bg-gray-50 p-5">
                <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <List className="h-3.5 w-3.5" /> In this article
                </h2>
                <ul className="mt-3 space-y-2 border-l-2 border-gray-200">
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a
                        href={`#${t.id}`}
                        className="-ml-0.5 block border-l-2 border-transparent pl-3 text-xs leading-snug text-gray-500 transition-colors hover:border-orange-500 hover:text-orange-600"
                      >
                        {t.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}

          {/* content */}
          <div
            className="prose prose-lg min-w-0 max-w-none prose-headings:font-extrabold prose-headings:text-navy-800 prose-p:leading-relaxed prose-p:text-gray-600 prose-a:text-orange-600 prose-strong:text-navy-800 prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

        {/* related products */}
        {mentionedProducts.length > 0 && (
          <section className="mt-16 rounded-3xl bg-gray-50 p-8">
            <h2 className="text-xl font-extrabold text-navy-800">
              🛍️ Products mentioned in this article
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mentionedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* comments disabled */}
        <div className="mt-12 flex items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-gray-200 p-8 text-center">
          <MessageCircleHeart className="h-6 w-6 text-orange-500" />
          <p className="text-sm text-gray-500">
            Comments are coming soon —{" "}
            <span className="font-bold text-navy-800">join our community to discuss</span>{" "}
            on WhatsApp (+254 745 198 099) or Facebook @JM Majiwa.
          </p>
        </div>

        {/* related posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-extrabold text-navy-800">Keep reading</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
