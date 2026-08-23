import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/data/service";
import { BlogBrowser } from "@/components/blog/BlogBrowser";
import { StoreUnavailable } from "@/components/errors/StoreUnavailable";

export const metadata: Metadata = {
  title: "Blog — Learning Hub",
  description:
    "Free guides, tutorials and playbooks on AI, design, business and education — written for Kenya by JM Majiwa.",
};

export const dynamic = "force-dynamic";

async function loadBlogPosts() {
  try {
    return await getBlogPosts();
  } catch (error) {
    console.error("[blog] content unavailable", error);
    return null;
  }
}

export default async function BlogPage() {
  const posts = await loadBlogPosts();
  if (!posts) return <StoreUnavailable />;
  return <BlogBrowser posts={posts} />;
}
