"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { MOCK_POSTS } from "@/lib/data/mock";
import { formatDate } from "@/lib/utils";

export function LearningHubPreview() {
  const posts = MOCK_POSTS.filter((p) => p.is_featured).slice(0, 3);

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
        >
          <div>
            <span className="badge-navy">📖 Learning Hub</span>
            <h2 className="section-title mt-4">
              Free Guides to <span className="text-gradient-orange">Level Up</span>
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-gray-500">
              Practical articles on AI, design, business and education — free,
              weekly, and written for Kenya.
            </p>
          </div>
          <Link href="/learning-hub" className="btn-secondary shrink-0">
            Visit Learning Hub
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
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
                  <span className="absolute left-3 top-3 badge-orange">
                    {post.category}
                  </span>
                )}
              </Link>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {post.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(post.published_at)}
                    </span>
                  )}
                  {post.read_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {post.read_time} min read
                    </span>
                  )}
                </div>
                <Link href={`/blog/${post.slug}`}>
                  <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-navy-800 transition-colors group-hover:text-orange-600">
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
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
