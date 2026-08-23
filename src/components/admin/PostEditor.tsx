"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  Loader2,
  Quote,
  Save,
  Send,
} from "lucide-react";
import type { BlogPost } from "@/types";
import { markdownToHtml } from "@/lib/markdown";
import { slugify } from "@/lib/utils";
import { Card, inputCls, labelCls, selectCls } from "@/components/admin/ui";

const CATEGORIES = ["AI", "ChatGPT", "Canva", "Business", "Kenya", "SEO", "Marketing", "Design", "Education"];

const MARKDOWN_TOOLS = [
  { icon: Bold, label: "Bold", before: "**", after: "**", block: false },
  { icon: Italic, label: "Italic", before: "*", after: "*", block: false },
  { icon: Heading2, label: "H2", before: "## ", after: "", block: true },
  { icon: Heading3, label: "H3", before: "### ", after: "", block: true },
  { icon: LinkIcon, label: "Link", before: "[", after: "](https://)", block: false },
  { icon: ImageIcon, label: "Image", before: "![alt](", after: ")", block: true },
  { icon: Code, label: "Code", before: "```\\n", after: "\\n```", block: true },
  { icon: Quote, label: "Quote", before: "> ", after: "", block: true },
  { icon: List, label: "List", before: "- ", after: "", block: true },
] as const;

interface PostEditorProps {
  initial?: BlogPost | null;
  editId?: string;
  authorName?: string;
}

export function PostEditor({ initial, editId, authorName = "JM Majiwa Admin" }: PostEditorProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initial));
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [category, setCategory] = useState(initial?.category ?? "AI");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [cover, setCover] = useState<string | null>(initial?.cover_image_url ?? null);
  const [content, setContent] = useState(initial?.content ?? "");
  const [published, setPublished] = useState(initial?.is_published ?? false);
  const [featured, setFeatured] = useState(initial?.is_featured ?? false);
  const [schedule, setSchedule] = useState("");
  const [metaTitle, setMetaTitle] = useState(initial?.meta_title ?? "");
  const [metaDesc, setMetaDesc] = useState(initial?.meta_description ?? "");
  const [saving, setSaving] = useState<"" | "draft" | "publish">("");

  const previewHtml = useMemo(() => markdownToHtml(content), [content]);
  const words = useMemo(() => content.split(/\s+/).filter(Boolean).length, [content]);

  const onTitle = (v: string) => {
    setTitle(v);
    if (!slugEdited) setSlug(slugify(v));
  };

  const insertMd = (before: string, after = "", block = false) => {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const selected = content.slice(start, end) || "text";
    const snippet = block ? `\n${before}${selected}${after}\n` : `${before}${selected}${after}`;
    const next = content.slice(0, start) + snippet + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + snippet.length, start + snippet.length);
    });
  };


  const uploadCover = async (file: File | undefined) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", "image");
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setCover(data.data.url);
      toast.success("Cover uploaded");
    } catch {
      // demo mode fallback
      setCover(URL.createObjectURL(file));
      toast.info("Demo mode — cover kept as local preview");
    }
  };

  const save = async (publish: boolean) => {
    if (title.trim().length < 3) return toast.error("Title is required");
    setSaving(publish ? "publish" : "draft");
    const payload = {
      title: title.trim(),
      slug: slug || slugify(title),
      excerpt,
      category,
      tags,
      cover_image_url: cover ?? undefined,
      content,
      author_name: authorName,
      is_published: publish ? true : published,
      is_featured: featured,
      published_at: schedule ? new Date(schedule).toISOString() : undefined,
      meta_title: metaTitle || undefined,
      meta_description: metaDesc || undefined,
    };
    try {
      const res = await fetch(editId ? `/api/admin/blog?id=${editId}` : "/api/admin/blog", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      toast.success(publish ? "Post published! 🎉" : "Draft saved");
      router.push("/admin/blog");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save post");
    } finally {
      setSaving("");
    }
  };

  return (
    <div className="space-y-6 pb-28">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* left column */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-bold text-white">Article</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className={labelCls}>Title *</label>
                <input value={title} onChange={(e) => onTitle(e.target.value)} placeholder="10 ChatGPT Prompts…" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Slug</label>
                <input value={slug} onChange={(e) => { setSlugEdited(true); setSlug(slugify(e.target.value)); }} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Excerpt (SEO + cards)</label>
                <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className={inputCls + " resize-none"} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-navy-900">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tags (Enter to add)</label>
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const t = tagInput.trim();
                        if (t && !tags.includes(t)) setTags((x) => [...x, t]);
                        setTagInput("");
                      }
                    }}
                    placeholder="chatgpt, kenya…"
                    className={inputCls}
                  />
                </div>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <button key={t} onClick={() => setTags((x) => x.filter((y) => y !== t))} className="rounded-full bg-orange-500/20 px-2.5 py-1 text-[11px] font-bold text-orange-300 hover:bg-red-500/20 hover:text-red-300">
                      #{t} ✕
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-white">
              Content <span className="ml-2 text-xs font-semibold text-white/40">{words} words • markdown supported</span>
            </h2>
            {/* toolbar */}
            <div className="mt-4 flex flex-wrap gap-1 rounded-t-2xl border border-white/10 bg-white/5 p-2">
              {MARKDOWN_TOOLS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.label}
                    type="button"
                    title={t.label}
                    onClick={() => insertMd(t.before, t.after, t.block)}
                    className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              placeholder={"## Your first heading\n\nWrite in **markdown**…"}
              className={inputCls + " resize-y rounded-t-none font-mono !text-xs leading-relaxed"}
            />
          </Card>
        </div>

        {/* right column */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-bold text-white">Cover image</h2>
            <label className="mt-4 flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-white/5 hover:border-orange-400/50">
              {cover ? (
                <div className="relative h-full w-full overflow-hidden rounded-2xl">
                  <Image src={cover} alt="Cover preview" fill sizes="400px" className="object-cover" />
                </div>
              ) : (
                <>
                  <ImageIcon className="h-6 w-6 text-white/40" />
                  <span className="text-xs text-white/50">Click to upload cover</span>
                </>
              )}
            </label>
            <input type="file" accept="image/*" className="hidden" id="cover-upload" onChange={(e) => uploadCover(e.target.files?.[0])} />
            <label htmlFor="cover-upload" className="btn-secondary mt-3 w-full cursor-pointer !py-2.5 text-sm">
              Choose Image
            </label>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-white">Status</h2>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-white/60">
                Author: <strong className="text-white">{authorName}</strong> (auto)
              </p>
              <label className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <span className="text-sm font-medium text-white/80">Published</span>
                <button type="button" role="switch" aria-checked={published} onClick={() => setPublished(!published)} className={`relative h-6 w-11 rounded-full transition-colors ${published ? "bg-neon-500" : "bg-white/15"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${published ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </label>
              <label className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <span className="text-sm font-medium text-white/80">Featured</span>
                <button type="button" role="switch" aria-checked={featured} onClick={() => setFeatured(!featured)} className={`relative h-6 w-11 rounded-full transition-colors ${featured ? "bg-orange-500" : "bg-white/15"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${featured ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </label>
              <div>
                <label className={labelCls}>Schedule publish</label>
                <input type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)} className={inputCls} />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-white">SEO</h2>
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between"><label className={labelCls}>Meta title</label><span className="text-[10px] text-white/40">{metaTitle.length}/60</span></div>
                <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value.slice(0, 80))} className={inputCls} />
              </div>
              <div>
                <div className="flex justify-between"><label className={labelCls}>Meta description</label><span className="text-[10px] text-white/40">{metaDesc.length}/160</span></div>
                <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value.slice(0, 200))} rows={3} className={inputCls + " resize-none"} />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white p-4">
                <p className="text-[11px] text-gray-500">jmmajiwa.com › blog › {slug || "slug"}</p>
                <p className="mt-0.5 text-sm leading-snug text-[#1a0dab]">{(metaTitle || title || "Post title") + " | JM Majiwa"}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">{metaDesc || excerpt || "Meta description preview…"}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-white">Live preview</h2>
            <div
              className="prose prose-sm mt-4 max-h-[420px] max-w-none overflow-y-auto rounded-2xl bg-white p-5 prose-headings:text-navy-800 prose-p:text-gray-600"
              dangerouslySetInnerHTML={{ __html: previewHtml || "<p class='text-gray-400'>Start writing to see the preview…</p>" }}
            />
          </Card>
        </div>
      </div>

      {/* save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-navy-900/95 backdrop-blur lg:left-72">
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <button type="button" onClick={() => save(false)} disabled={saving !== ""} className="inline-flex items-center gap-2 rounded-xl border-2 border-white/15 px-6 py-3 text-sm font-semibold text-white/70 hover:bg-white/10 disabled:opacity-50">
            {saving === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </button>
          <button type="button" onClick={() => save(true)} disabled={saving !== ""} className="btn-primary">
            {saving === "publish" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
