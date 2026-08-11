"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  ImagePlus,
  Loader2,
  Save,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { MOCK_CATEGORIES } from "@/lib/data/mock";
import { formatPrice, slugify } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FormState {
  title: string;
  slug: string;
  slugEdited: boolean;
  description: string;
  short_description: string;
  category_id: string;
  price: string;
  sale_price: string;
  tags: string;
  features: string;
  what_is_included: string;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new: boolean;
  is_published: boolean;
  meta_title: string;
  meta_description: string;
}

const INITIAL: FormState = {
  title: "",
  slug: "",
  slugEdited: false,
  description: "",
  short_description: "",
  category_id: "",
  price: "",
  sale_price: "",
  tags: "",
  features: "",
  what_is_included: "",
  is_featured: false,
  is_best_seller: false,
  is_new: true,
  is_published: true,
  meta_title: "",
  meta_description: "",
};

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onTitle = (value: string) =>
    setForm((f) => ({
      ...f,
      title: value,
      slug: f.slugEdited ? f.slug : slugify(value),
    }));

  const onThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setThumbnail(URL.createObjectURL(file));
  };

  const onGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setGallery((g) => [...g, ...files.map((f) => URL.createObjectURL(f))].slice(0, 6));
  };

  const valid = useMemo(() => {
    const price = Number(form.price);
    return (
      form.title.trim().length >= 3 &&
      form.slug.trim().length >= 3 &&
      form.category_id &&
      price > 0 &&
      form.description.trim().length > 0
    );
  }, [form]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      toast.error("Please fill in title, category, price and description.");
      return;
    }
    setSaving(true);
    // In production this POSTs to a service-role API that writes to Supabase
    // and uploads files to Supabase Storage.
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success(
      "Product saved locally (demo). Connect Supabase to persist & publish."
    );
    router.push("/admin/products");
  };

  const inputCls =
    "w-full rounded-xl border-2 border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-orange-400";
  const labelCls = "mb-1.5 block text-sm font-semibold text-white/80";

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-white md:text-3xl">
        Add New Product
      </h1>
      <p className="mt-1 text-sm text-white/50">
        Fill in the details below — the slug generates automatically.
      </p>

      <form onSubmit={save} className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Main column */}
        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-lg font-bold text-white">Basic Information</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className={labelCls}>Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => onTitle(e.target.value)}
                  placeholder="e.g. Ultimate ChatGPT Prompt Pack 500"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => {
                    set("slugEdited", true);
                    set("slug", slugify(e.target.value));
                  }}
                  placeholder="auto-generated-from-title"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={5}
                  placeholder="What makes this product valuable?"
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div>
                <label className={labelCls}>Short Description</label>
                <textarea
                  value={form.short_description}
                  onChange={(e) => set("short_description", e.target.value)}
                  rows={2}
                  placeholder="One or two sentences shown on product cards."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-lg font-bold text-white">Media</h2>
            <div className="mt-5 space-y-5">
              <div>
                <label className={labelCls}>Digital Product File *</label>
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-white/5 px-6 py-8 text-center transition-colors hover:border-orange-400/50">
                  <Upload className="h-6 w-6 text-white/40" />
                  <span className="text-sm font-medium text-white/70">
                    {productFile
                      ? `${productFile.name} (${(productFile.size / 1024 / 1024).toFixed(2)} MB)`
                      : "Click to upload ZIP / PDF / templates"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setProductFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              <div>
                <label className={labelCls}>Thumbnail</label>
                <div className="flex items-center gap-4">
                  <label className="flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-white/15 bg-white/5 transition-colors hover:border-orange-400/50">
                    {thumbnail ? (
                      <Image src={thumbnail} alt="Thumbnail" width={112} height={112} className="h-full w-full object-cover" />
                    ) : (
                      <ImagePlus className="h-6 w-6 text-white/40" />
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={onThumbnail} />
                  </label>
                  <p className="text-xs text-white/40">
                    900×675px recommended (4:3). Shown on cards and search.
                  </p>
                </div>
              </div>
              <div>
                <label className={labelCls}>Gallery Images (up to 6)</label>
                <div className="flex flex-wrap gap-3">
                  {gallery.map((img, i) => (
                    <div key={img + i} className="relative h-20 w-20 overflow-hidden rounded-xl">
                      <Image src={img} alt={`Gallery ${i + 1}`} fill sizes="80px" className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setGallery((g) => g.filter((_, x) => x !== i))}
                        className="absolute right-1 top-1 rounded-full bg-navy-950/70 p-1 text-white"
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-white/5 transition-colors hover:border-orange-400/50">
                    <ImagePlus className="h-5 w-5 text-white/40" />
                    <input type="file" accept="image/*" multiple className="hidden" onChange={onGallery} />
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-lg font-bold text-white">Content Lists</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className={labelCls}>Tags (comma separated)</label>
                <input
                  value={form.tags}
                  onChange={(e) => set("tags", e.target.value)}
                  placeholder="chatgpt, prompts, marketing"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Features (one per line)</label>
                <textarea
                  value={form.features}
                  onChange={(e) => set("features", e.target.value)}
                  rows={4}
                  placeholder={"500 copy-paste prompts\nLifetime updates"}
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div>
                <label className={labelCls}>What&apos;s Included (one per line)</label>
                <textarea
                  value={form.what_is_included}
                  onChange={(e) => set("what_is_included", e.target.value)}
                  rows={4}
                  placeholder={"120-page PDF library\nNotion template"}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-lg font-bold text-white">SEO</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className={labelCls}>Meta Title</label>
                <input
                  value={form.meta_title}
                  onChange={(e) => set("meta_title", e.target.value)}
                  placeholder="Defaults to product title"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Meta Description</label>
                <textarea
                  value={form.meta_description}
                  onChange={(e) => set("meta_description", e.target.value)}
                  rows={2}
                  placeholder="Defaults to short description"
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-lg font-bold text-white">Pricing</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className={labelCls}>Price (KES) *</label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="1200"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Sale Price (KES)</label>
                <input
                  type="number"
                  min="0"
                  value={form.sale_price}
                  onChange={(e) => set("sale_price", e.target.value)}
                  placeholder="Optional"
                  className={inputCls}
                />
              </div>
              {Number(form.price) > 0 && Number(form.sale_price) > 0 && (
                <p className="rounded-xl bg-neon-500/10 px-4 py-2.5 text-xs font-semibold text-neon-300">
                  Customers save{" "}
                  {Math.round(
                    ((Number(form.price) - Number(form.sale_price)) /
                      Number(form.price)) *
                      100
                  )}
                  % ({formatPrice(Number(form.price) - Number(form.sale_price))})
                </p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-lg font-bold text-white">Category & Flags</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className={labelCls}>Category *</label>
                <select
                  value={form.category_id}
                  onChange={(e) => set("category_id", e.target.value)}
                  className={inputCls}
                >
                  <option value="" className="bg-navy-900">Select a category…</option>
                  {MOCK_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id} className="bg-navy-900">
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              {(
                [
                  ["is_featured", "Featured on homepage"],
                  ["is_best_seller", "Best Seller badge"],
                  ["is_new", "New badge"],
                  ["is_published", "Published (visible in store)"],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3"
                >
                  <span className="text-sm font-medium text-white/80">{label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form[key]}
                    onClick={() => set(key, !form[key])}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      form[key] ? "bg-neon-500" : "bg-white/15"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
                        form[key] ? "left-[22px]" : "left-0.5"
                      )}
                    />
                  </button>
                </label>
              ))}
            </div>
          </section>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-white/15 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Eye className="h-4 w-4" /> {preview ? "Hide Preview" : "Preview"}
            </button>
            <button
              type="submit"
              disabled={saving || !valid}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Product
            </button>
          </div>

          {preview && (
            <div className="rounded-3xl bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                {MOCK_CATEGORIES.find((c) => c.id === form.category_id)?.name ??
                  "Category"}
              </p>
              <h3 className="mt-1 line-clamp-2 font-bold text-navy-800">
                {form.title || "Product title preview"}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                {form.short_description || "Short description preview…"}
              </p>
              <p className="mt-3 text-xl font-extrabold text-navy-800">
                {form.sale_price
                  ? formatPrice(Number(form.sale_price))
                  : form.price
                    ? formatPrice(Number(form.price))
                    : "KES 0"}
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
