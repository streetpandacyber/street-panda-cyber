"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, Eye, Search } from "lucide-react";
import type { BlogPost } from "@/types";
import { formatDate, getInitials } from "@/lib/utils";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  AI: "bg-violet-100 text-violet-700",
  ChatGPT: "bg-orange-100 text-orange-700",
  Canva: "bg-blue-100 text-blue-700",
  Business: "bg-navy-100 text-navy-700",
  Kenya: "bg-neon-100 text-neon-700",
  Design: "bg-pink-100 text-pink-700",
  Marketing: "bg-yellow-100 text-yellow-700",
  SEO: "bg-teal-100 text-teal-700",
};

const badgeColor = (cat?: string) => CATEGORY_COLORS[cat ?? ""] ?? "bg-gray-100 text-gray-600";

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="card-premium group flex h-full flex-col overflow-hidden">
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-gray-100">
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
          <span className={cn("absolute left-3 top-3 badge", badgeColor(post.category))}>
            {post.category}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <Link href={`/blog/${post.slug}`}>
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-navy-800 group-hover:text-orange-600">
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-500">{post.excerpt}</p>
        )}
        <div className="mt-4 flex items-center gap-2.5 border-t border-gray-100 pt-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-600 text-[10px] font-bold text-white">
            {getInitials(post.author_name ?? "JM Majiwa")}
          </span>
          <span className="line-clamp-1 text-xs font-semibold text-navy-800">
            {post.author_name ?? "JM Majiwa"}
          </span>
          <span className="ml-auto flex items-center gap-2 text-[11px] text-gray-400">
            {post.read_time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {post.read_time} min
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {post.view_count.toLocaleString()}
            </span>
          </span>
        </div>
        {post.published_at && (
          <p className="mt-2 flex items-center gap-1 text-[11px] text-gray-400">
            <CalendarDays className="h-3 w-3" /> {formatDate(post.published_at)}
          </p>
        )}
      </div>
    </article>
  );
}

interface BlogBrowserProps {
  posts: BlogPost[];
}

export function BlogBrowser({ posts }: BlogBrowserProps) {
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(6);

  const categories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.category).filter(Boolean))) as string[],
    [posts]
  );

  const featured = useMemo(
    () => [...posts].sort((a, b) => b.view_count - a.view_count)[0],
    [posts]
  );

  const popular = useMemo(
    () => [...posts].sort((a, b) => b.view_count - a.view_count).slice(0, 5),
    [posts]
  );

  const filtered = useMemo(() => {
    let list = posts;
    if (tab !== "All") list = list.filter((p) => p.category === tab);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.excerpt?.toLowerCase().includes(s) ||
          p.tags?.some((t) => t.toLowerCase().includes(s))
      );
    }
    return list;
  }, [posts, tab, search]);

  const catCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of posts) {
      if (p.category) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    }
    return m;
  }, [posts]);

  return (
    <div className="container-custom py-14">
      {/* hero */}
      <div className="text-center">
        <span className="badge-orange">📖 Learning Hub</span>
        <h1 className="section-title mt-4">
          JM Majiwa <span className="text-gradient-orange">Learning Hub</span>
        </h1>
        <p className="section-subtitle mt-4">
          Free guides, tutorials and playbooks on AI, design and business —
          written for Kenya, updated weekly.
        </p>
      </div>

      {/* featured post */}
      {featured && tab === "All" && !search && (
        <Link
          href={`/blog/${featured.slug}`}
          className="card-premium group mt-12 grid overflow-hidden lg:grid-cols-2"
        >
          <div className="relative aspect-[16/9] bg-gray-100 lg:aspect-auto lg:min-h-[320px]">
            {featured.cover_image_url && (
              <Image
                src={featured.cover_image_url}
                alt={featured.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </div>
          <div className="flex flex-col justify-center p-8 lg:p-10">
            <div className="flex items-center gap-2">
              <span className={cn("badge", badgeColor(featured.category))}>{featured.category}</span>
              <span className="badge-orange">⭐ Featured</span>
            </div>
            <h2 className="mt-4 text-2xl font-extrabold leading-tight text-navy-800 group-hover:text-orange-600 lg:text-3xl">
              {featured.title}
            </h2>
            {featured.excerpt && (
              <p className="mt-3 line-clamp-3 text-gray-500">{featured.excerpt}</p>
            )}
            <div className="mt-5 flex items-center gap-3 text-xs text-gray-400">
              <span className="font-semibold text-navy-800">
                {featured.author_name ?? "JM Majiwa"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {featured.read_time} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {featured.view_count.toLocaleString()} views
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* tabs */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => {
              setTab(c);
              setVisible(6);
            }}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold transition-colors",
              tab === c
                ? "bg-orange-500 text-white shadow-glow-orange"
                : "bg-white text-gray-500 shadow-soft-sm hover:bg-gray-50"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px]">
        {/* grid */}
        <div>
          {filtered.length === 0 ? (
            <p className="rounded-3xl bg-gray-50 p-12 text-center text-gray-500">
              No articles match — try another tab or search term.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {filtered.slice(0, visible).map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
          {visible < filtered.length && (
            <div className="mt-8 text-center">
              <button onClick={() => setVisible((v) => v + 6)} className="btn-secondary">
                Load More Articles
              </button>
            </div>
          )}
        </div>

        {/* sidebar */}
        <aside className="space-y-6">
          <div className="card-premium p-5">
            <h3 className="text-sm font-bold text-navy-800">Search posts</h3>
            <div className="relative mt-3">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisible(6);
                }}
                placeholder="Search articles…"
                className="input-field !py-2.5 !pl-10 text-sm"
              />
            </div>
          </div>

          <div className="card-premium p-5">
            <h3 className="text-sm font-bold text-navy-800">Popular posts</h3>
            <ul className="mt-3 space-y-3">
              {popular.map((p, i) => (
                <li key={p.id}>
                  <Link href={`/blog/${p.slug}`} className="group flex gap-3">
                    <span className="text-xl font-extrabold text-gray-200">{i + 1}</span>
                    <span className="line-clamp-2 text-sm font-semibold text-gray-600 group-hover:text-orange-600">
                      {p.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-premium p-5">
            <h3 className="text-sm font-bold text-navy-800">Categories</h3>
            <ul className="mt-3 space-y-2">
              {Array.from(catCounts.entries()).map(([cat, count]) => (
                <li key={cat}>
                  <button
                    onClick={() => setTab(cat)}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <span>{cat}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500">
                      {count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-premium p-5">
            <h3 className="text-sm font-bold text-navy-800">Free weekly resources 🎁</h3>
            <p className="mt-1 text-xs text-gray-500">
              Join 10,000+ subscribers getting free AI prompts every Friday.
            </p>
            <div className="mt-3">
              <NewsletterForm compact />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
