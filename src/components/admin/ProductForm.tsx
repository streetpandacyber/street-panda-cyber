"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  FileUp,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import type { Category, Product } from "@/types";
import { formatFileSize, slugify } from "@/lib/utils";
import { Card, inputCls, labelCls, selectCls } from "@/components/admin/ui";

const SUGGESTED_TAGS = ["AI", "ChatGPT", "Prompts", "Kenya", "Canva", "Templates", "Business", "Study", "eBook", "Notion"];
const FILE_ACCEPT = ".pdf,.zip,.docx,.xlsx,.pptx";
const MAX_FILE = 500 * 1024 * 1024;

interface ProductFormProps {
  initial?: Product | null;
  editId?: string;
}

interface UploadState {
  progress: number;
  uploading: boolean;
  url?: string;
  path?: string;
  name?: string;
  size?: string;
  format?: string;
}

const EMPTY_UPLOAD: UploadState = { progress: 0, uploading: false };

/** XHR upload with progress; falls back to a local preview when the API is unavailable (demo mode). */
function uploadWithProgress(
  file: File,
  type: "image" | "file",
  onProgress: (pct: number) => void
): Promise<{ url: string; path?: string; demo?: boolean }> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ url: data.data.url, path: data.data.path });
        } else if (xhr.status === 503) {
          // demo mode — local preview only
          simulate(onProgress).then(() =>
            resolve({ url: URL.createObjectURL(file), demo: true })
          );
        } else {
          reject(new Error(data.error ?? "Upload failed"));
        }
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}

function simulate(onProgress: (pct: number) => void) {
  return new Promise<void>((resolve) => {
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(100, p + 18);
      onProgress(p);
      if (p >= 100) {
        clearInterval(t);
        resolve();
      }
    }, 120);
  });
}

export function ProductForm({ initial, editId }: ProductFormProps) {
  const router = useRouter();

  /* basic */
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initial));
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? "");
  const [shortDesc, setShortDesc] = useState(initial?.short_description ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categories, setCategories] = useState<Category[]>([]);

  /* pricing */
  const [price, setPrice] = useState(initial?.price ? String(initial.price) : "");
  const [salePrice, setSalePrice] = useState(
    initial?.sale_price ? String(initial.sale_price) : ""
  );

  /* media */
  const [thumb, setThumb] = useState<UploadState>({
    ...EMPTY_UPLOAD,
    url: initial?.thumbnail_url,
  });
  const [gallery, setGallery] = useState<string[]>(initial?.gallery_urls ?? []);
  const [file, setFile] = useState<UploadState>({
    ...EMPTY_UPLOAD,
    url: initial?.file_url,
    name: initial?.file_url?.split("/").pop(),
    size: initial?.file_size,
    format: initial?.file_format,
  });

  /* details */
  const [features, setFeatures] = useState<string[]>(
    initial?.features?.length ? initial.features : [""]
  );
  const [included, setIncluded] = useState<string[]>(
    initial?.what_is_included?.length ? initial.what_is_included : [""]
  );
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  /* status */
  const [published, setPublished] = useState(initial?.is_published ?? false);
  const [featured, setFeatured] = useState(initial?.is_featured ?? false);
  const [bestSeller, setBestSeller] = useState(initial?.is_best_seller ?? false);
  const [isNew, setIsNew] = useState(initial?.is_new ?? true);

  /* seo */
  const [metaTitle, setMetaTitle] = useState(initial?.meta_title ?? "");
  const [metaDesc, setMetaDesc] = useState(initial?.meta_description ?? "");

  const [saving, setSaving] = useState<"" | "draft" | "publish">("");
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data ?? []))
      .catch(() => undefined);
  }, []);

  const discountPct = useMemo(() => {
    const p = Number(price);
    const s = Number(salePrice);
    if (p > 0 && s > 0 && s < p) return Math.round(((p - s) / p) * 100);
    return 0;
  }, [price, salePrice]);

  const onTitle = (v: string) => {
    setTitle(v);
    if (!slugEdited) setSlug(slugify(v));
  };

  const addTag = (t: string) => {
    const clean = t.trim();
    if (clean && !tags.includes(clean)) setTags((x) => [...x, clean]);
    setTagInput("");
  };

  const onThumb = async (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Thumbnail must be an image");
    setThumb((t) => ({ ...t, uploading: true, progress: 0 }));
    try {
      const res = await uploadWithProgress(f, "image", (p) =>
        setThumb((t) => ({ ...t, progress: p }))
      );
      setThumb({ progress: 100, uploading: false, url: res.url, path: res.path });
      toast.success("Thumbnail uploaded");
    } catch (err) {
      setThumb((t) => ({ ...t, uploading: false }));
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const onGallery = async (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files).slice(0, 8 - gallery.length);
    for (const f of list) {
      try {
        const res = await uploadWithProgress(f, "image", () => undefined);
        setGallery((g) => (g.length < 8 ? [...g, res.url] : g));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gallery upload failed");
      }
    }
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    const okTypes = ["pdf", "zip", "docx", "xlsx", "pptx", "doc", "xls", "ppt"];
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!okTypes.includes(ext)) {
      return toast.error("Supported formats: PDF, ZIP, DOCX, XLSX, PPTX");
    }
    if (f.size > MAX_FILE) return toast.error("Max file size is 500MB");
    setFile((t) => ({ ...t, uploading: true, progress: 0 }));
    try {
      const res = await uploadWithProgress(f, "file", (p) =>
        setFile((t) => ({ ...t, progress: p }))
      );
      setFile({
        progress: 100,
        uploading: false,
        url: res.path ?? res.url,
        name: f.name,
        size: formatFileSize(f.size),
        format: ext.toUpperCase(),
      });
      toast.success("Product file uploaded");
    } catch (err) {
      setFile((t) => ({ ...t, uploading: false }));
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const save = async (publish: boolean) => {
    if (title.trim().length < 3) return toast.error("Title is required (min 3 chars)");
    if (!categoryId) return toast.error("Choose a category");
    if (!price || Number(price) <= 0) return toast.error("Enter a valid price");

    setSaving(publish ? "publish" : "draft");
    const payload = {
      title: title.trim(),
      slug: slug || slugify(title),
      category_id: categoryId || undefined,
      short_description: shortDesc,
      description,
      price: Number(price),
      sale_price: salePrice ? Number(salePrice) : undefined,
      thumbnail_url: thumb.url ?? undefined,
      gallery_urls: gallery.length ? gallery : undefined,
      file_url: file.url ?? undefined,
      file_size: file.size ?? undefined,
      file_format: file.format ?? undefined,
      tags,
      features: features.map((x) => x.trim()).filter(Boolean),
      what_is_included: included.map((x) => x.trim()).filter(Boolean),
      is_published: publish ? true : published,
      is_featured: featured,
      is_best_seller: bestSeller,
      is_new: isNew,
      meta_title: metaTitle || undefined,
      meta_description: metaDesc || undefined,
    };

    try {
      const res = await fetch(
        editId ? `/api/admin/products/${editId}` : "/api/admin/products",
        {
          method: editId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      toast.success(
        publish ? "Product published! 🎉" : "Saved as draft"
      );
      router.push("/admin/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save product");
    } finally {
      setSaving("");
    }
  };

  const toggle = (
    value: boolean,
    set: (v: boolean) => void,
    label: string
  ) => (
    <label className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
      <span className="text-sm font-medium text-white/80">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => set(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-neon-500" : "bg-white/15"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${value ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
    </label>
  );

  return (
    <div className="space-y-6 pb-28">
      {/* SECTION 1 — basic */}
      <Card>
        <h2 className="text-lg font-bold text-white">1. Basic Information</h2>
        <div className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>Title *</label>
              <input value={title} onChange={(e) => onTitle(e.target.value)} placeholder="Ultimate ChatGPT Prompt Pack 500" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input value={slug} onChange={(e) => { setSlugEdited(true); setSlug(slugify(e.target.value)); }} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Category *</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={selectCls}>
              <option value="" className="bg-navy-900">Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-navy-900">{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex justify-between">
              <label className={labelCls}>Short Description</label>
              <span className={`text-xs ${shortDesc.length > 160 ? "text-red-400" : "text-white/40"}`}>{shortDesc.length}/160</span>
            </div>
            <textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value.slice(0, 200))} rows={2} maxLength={200} placeholder="One or two punchy sentences shown on cards…" className={inputCls + " resize-none"} />
          </div>
          <div>
            <label className={labelCls}>Full Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} placeholder="Everything a buyer needs to know…" className={inputCls + " resize-none"} />
          </div>
        </div>
      </Card>

      {/* SECTION 2 — pricing */}
      <Card>
        <h2 className="text-lg font-bold text-white">2. Pricing (KES)</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelCls}>Regular Price *</label>
            <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1200" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Sale Price (optional)</label>
            <input type="number" min={0} value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="899" className={inputCls} />
          </div>
          <div className="flex items-end pb-1">
            {discountPct > 0 ? (
              <span className="rounded-full bg-neon-500/15 px-4 py-2 text-sm font-bold text-neon-300">
                🔥 Customers save {discountPct}%
              </span>
            ) : (
              <span className="text-xs text-white/30">Add a sale price to show a discount badge</span>
            )}
          </div>
        </div>
      </Card>

      {/* SECTION 3 — images */}
      <Card>
        <h2 className="text-lg font-bold text-white">3. Product Images</h2>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div>
            <label className={labelCls}>Thumbnail</label>
            <button
              type="button"
              onClick={() => thumbInputRef.current?.click()}
              className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-white/5 transition-colors hover:border-orange-400/50"
            >
              {thumb.url ? (
                <div className="relative h-full w-full overflow-hidden rounded-2xl">
                  <Image src={thumb.url} alt="Thumbnail preview" fill sizes="300px" className="object-cover" />
                </div>
              ) : (
                <>
                  <ImagePlus className="h-6 w-6 text-white/40" />
                  <span className="text-xs text-white/50">Drag & drop or click to browse</span>
                </>
              )}
            </button>
            <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onThumb(e.target.files?.[0])} />
            {thumb.uploading && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${thumb.progress}%` }} />
              </div>
            )}
          </div>
          <div>
            <label className={labelCls}>Gallery ({gallery.length}/8)</label>
            <div className="grid grid-cols-4 gap-2">
              {gallery.map((img, i) => (
                <div key={img + i} className="group relative aspect-square overflow-hidden rounded-xl bg-white/10">
                  <Image src={img} alt={`Gallery ${i + 1}`} fill sizes="80px" className="object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-navy-950/70 opacity-0 transition-opacity group-hover:opacity-100">
                    <button type="button" disabled={i === 0} onClick={() => setGallery((g) => { const n = [...g]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; })} className="rounded p-1 text-white/70 hover:text-white" aria-label="Move left"><ArrowLeft className="h-3.5 w-3.5" /></button>
                    <button type="button" disabled={i === gallery.length - 1} onClick={() => setGallery((g) => { const n = [...g]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; return n; })} className="rounded p-1 text-white/70 hover:text-white" aria-label="Move right"><ArrowRight className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => setGallery((g) => g.filter((_, x) => x !== i))} className="rounded p-1 text-red-300 hover:text-red-200" aria-label="Remove"><X className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
              {gallery.length < 8 && (
                <button type="button" onClick={() => galleryInputRef.current?.click()} className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-white/15 text-white/40 hover:border-orange-400/50">
                  <Plus className="h-5 w-5" />
                </button>
              )}
            </div>
            <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onGallery(e.target.files)} />
          </div>
        </div>
      </Card>

      {/* SECTION 4 — digital file */}
      <Card>
        <h2 className="text-lg font-bold text-white">4. Digital File</h2>
        <div className="mt-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-white/5 px-6 py-10 transition-colors hover:border-orange-400/50"
          >
            <FileUp className="h-7 w-7 text-white/40" />
            {file.name ? (
              <span className="text-sm font-semibold text-white">
                📄 {file.name} <span className="text-white/40">({file.size} • {file.format})</span>
              </span>
            ) : (
              <span className="text-sm text-white/50">Upload the product file — PDF, ZIP, DOCX, XLSX, PPTX (max 500MB)</span>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept={FILE_ACCEPT} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          {file.uploading && (
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-neon-500 transition-all" style={{ width: `${file.progress}%` }} />
              </div>
              <p className="mt-1 text-right text-xs text-white/40">{file.progress}%</p>
            </div>
          )}
          <div className="mt-3 flex gap-4 text-xs text-white/40">
            <span>Format: <strong className="text-white/70">{file.format ?? "—"}</strong></span>
            <span>Size: <strong className="text-white/70">{file.size ?? "—"}</strong></span>
          </div>
        </div>
      </Card>

      {/* SECTION 5 — details */}
      <Card>
        <h2 className="text-lg font-bold text-white">5. Product Details</h2>
        <div className="mt-5 space-y-6">
          {(
            [
              ["Features", features, setFeatures, "Works with free ChatGPT account"],
              ["What's Included", included, setIncluded, "500 Prompt PDF (50 pages)"],
            ] as const
          ).map(([label, list, setList, placeholder]) => (
            <div key={label}>
              <label className={labelCls}>{label}</label>
              <div className="space-y-2">
                {list.map((value, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={value}
                      onChange={(e) => setList((l) => l.map((x, idx) => (idx === i ? e.target.value : x)))}
                      placeholder={placeholder}
                      className={inputCls}
                    />
                    <button type="button" onClick={() => setList((l) => l.filter((_, idx) => idx !== i))} className="shrink-0 rounded-xl p-2 text-white/40 hover:bg-red-500/20 hover:text-red-300" aria-label="Remove line">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => setList((l) => [...l, ""])} className="flex items-center gap-1.5 text-xs font-bold text-orange-300 hover:text-orange-200">
                  <Plus className="h-3.5 w-3.5" /> Add line
                </button>
              </div>
            </div>
          ))}

          <div>
            <label className={labelCls}>Tags</label>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-white/10 bg-white/5 p-2.5">
              {tags.map((t) => (
                <span key={t} className="flex items-center gap-1 rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold text-orange-300">
                  #{t}
                  <button type="button" onClick={() => setTags((x) => x.filter((y) => y !== t))} aria-label={`Remove ${t}`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                placeholder="Type and press Enter…"
                className="min-w-[140px] flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((t) => (
                <button key={t} type="button" onClick={() => addTag(t)} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/50 hover:bg-white/10 hover:text-white">
                  + {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 6 — status */}
      <Card>
        <h2 className="text-lg font-bold text-white">6. Status & Visibility</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {toggle(published, setPublished, "Published (visible in store)")}
          {toggle(featured, setFeatured, "Featured on homepage")}
          {toggle(bestSeller, setBestSeller, "Best Seller badge")}
          {toggle(isNew, setIsNew, "New badge")}
        </div>
      </Card>

      {/* SECTION 7 — SEO */}
      <Card>
        <h2 className="text-lg font-bold text-white">7. SEO</h2>
        <div className="mt-5 space-y-4">
          <div>
            <div className="flex justify-between">
              <label className={labelCls}>Meta Title</label>
              <span className={`text-xs ${metaTitle.length > 60 ? "text-red-400" : "text-white/40"}`}>{metaTitle.length}/60</span>
            </div>
            <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value.slice(0, 80))} placeholder="Defaults to product title" className={inputCls} />
          </div>
          <div>
            <div className="flex justify-between">
              <label className={labelCls}>Meta Description</label>
              <span className={`text-xs ${metaDesc.length > 160 ? "text-red-400" : "text-white/40"}`}>{metaDesc.length}/160</span>
            </div>
            <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value.slice(0, 200))} rows={3} className={inputCls + " resize-none"} />
          </div>
          {/* Google preview */}
          <div className="rounded-2xl border border-white/10 bg-white p-5">
            <p className="text-xs text-gray-500">jmmajiwa.com › products › {slug || "slug"}</p>
            <p className="mt-1 text-lg leading-snug text-[#1a0dab]">
              {(metaTitle || title || "Product title") + " | JM Majiwa"}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
              {metaDesc || shortDesc || "Your meta description will appear here — keep it under 160 characters for the best click-through rate."}
            </p>
          </div>
        </div>
      </Card>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-navy-900/95 backdrop-blur lg:left-72">
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <button
            type="button"
            onClick={() => save(false)}
            disabled={saving !== ""}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-white/15 px-6 py-3 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            {saving === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save as Draft
          </button>
          <button type="button" onClick={() => save(true)} disabled={saving !== ""} className="btn-primary">
            {saving === "publish" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save & Publish
          </button>
        </div>
      </div>
    </div>
  );
}
