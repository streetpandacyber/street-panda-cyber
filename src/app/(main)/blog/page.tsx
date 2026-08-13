import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/data/service";
import { BlogBrowser } from "@/components/blog/BlogBrowser";

export const metadata: Metadata = {
  title: "Blog — Learning Hub",
  description:
    "Free guides, tutorials and playbooks on AI, design, business and education — written for Kenya by JM Majiwa.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return <BlogBrowser posts={posts} />;
}
