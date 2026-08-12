import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Check,
  ChevronRight,
  Download,
  FileText,
  Lock,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  getProductBySlug,
  getProducts,
  getRelatedProducts,
} from "@/lib/data/service";

export const revalidate = 3600; // ISR: regenerate product pages hourly

export async function generateStaticParams() {
  try {
    const products = await getProducts({});
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}
import { MOCK_REVIEWS } from "@/lib/data/mock";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductActions } from "@/components/product/ProductActions";
import { FaqAccordion } from "@/components/product/FaqAccordion";
import { StarRating } from "@/components/product/StarRating";
import { ProductCard } from "@/components/marketplace/ProductCard";
import {
  calculateDiscount,
  formatDate,
  formatPrice,
} from "@/lib/utils";

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.meta_title ?? product.title,
    description:
      product.meta_description ?? product.short_description ?? undefined,
    openGraph: product.thumbnail_url
      ? { images: [{ url: product.thumbnail_url }] }
      : undefined,
  };
}

const FAQS = [
  {
    question: "How do I receive my download?",
    answer:
      "The moment your M-Pesa payment is confirmed, your download links unlock automatically on the success page and in your email. You can also access them anytime from your dashboard.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept M-Pesa via Safaricom's official Daraja API. Your payment is processed securely by Safaricom — card payments via Stripe are coming soon.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Yes — every purchase is covered by our 30-day money-back guarantee. If the product isn't what you expected, email streetpandacyber@gmail.com for a full refund.",
  },
  {
    question: "Do I get future updates?",
    answer:
      "Absolutely. All purchases include lifetime access and free updates. When the product improves, you can re-download the latest version from your dashboard.",
  },
];

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const ownReviews = MOCK_REVIEWS.filter((r) => r.product_id === product.id);
  const reviews = (ownReviews.length > 0 ? ownReviews : MOCK_REVIEWS).slice(0, 3);

  const onSale =
    product.sale_price !== undefined && product.sale_price < product.price;
  const gallery = [
    ...(product.gallery_urls?.length
      ? product.gallery_urls
      : product.thumbnail_url
        ? [product.thumbnail_url]
        : []),
  ];

  return (
    <div className="bg-white">
      <div className="container-custom py-10 md:py-14">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-orange-600">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/marketplace" className="hover:text-orange-600">
            Marketplace
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {product.category && (
            <>
              <Link
                href={`/marketplace?category=${product.category.slug}`}
                className="hover:text-orange-600"
              >
                {product.category.name}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
          <span className="line-clamp-1 font-medium text-navy-800">
            {product.title}
          </span>
        </nav>

        {/* Main grid */}
        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <ProductGallery images={gallery} title={product.title} />

          <div>
            {product.category && (
              <Link
                href={`/marketplace?category=${product.category.slug}`}
                className="badge-orange"
              >
                {product.category.icon} {product.category.name}
              </Link>
            )}
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-navy-800 md:text-4xl">
              {product.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <StarRating rating={product.average_rating ?? 4.8} />
                <strong className="text-navy-800">
                  {product.average_rating?.toFixed(1) ?? "4.8"}
                </strong>
                <span className="text-gray-500">
                  ({product.review_count ?? 0} reviews)
                </span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">
                {product.total_sales.toLocaleString()} sales
              </span>
            </div>

            {/* Price */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-4xl font-extrabold text-navy-800">
                {formatPrice(product.sale_price ?? product.price, product.currency)}
              </span>
              {onSale && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  <span className="badge bg-red-500 text-white">
                    Save {calculateDiscount(product.price, product.sale_price!)}%
                  </span>
                </>
              )}
            </div>

            <div className="mt-6">
              <ProductActions product={product} />
            </div>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: Zap, label: "Instant Download", color: "text-neon-500" },
                { icon: Lock, label: "Secure M-Pesa Payment", color: "text-orange-500" },
                { icon: ShieldCheck, label: "30-Day Guarantee", color: "text-navy-600" },
              ].map(({ icon: Icon, label, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-navy-700"
                >
                  <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                  {label}
                </div>
              ))}
            </div>

            {/* Meta */}
            <dl className="mt-6 space-y-2 rounded-2xl border border-gray-100 p-5 text-sm">
              {product.file_format && (
                <div className="flex justify-between">
                  <dt className="flex items-center gap-2 text-gray-500">
                    <FileText className="h-4 w-4" /> Format
                  </dt>
                  <dd className="font-semibold text-navy-800">{product.file_format}</dd>
                </div>
              )}
              {product.file_size && (
                <div className="flex justify-between">
                  <dt className="flex items-center gap-2 text-gray-500">
                    <Download className="h-4 w-4" /> Size
                  </dt>
                  <dd className="font-semibold text-navy-800">{product.file_size}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Last updated</dt>
                <dd className="font-semibold text-navy-800">
                  {formatDate(product.updated_at)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Description + features */}
        <div className="mt-16 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold text-navy-800">Description</h2>
            {product.description && (
              <p className="mt-4 leading-relaxed text-gray-600">
                {product.description}
              </p>
            )}

            {product.features && product.features.length > 0 && (
              <>
                <h3 className="mt-8 text-xl font-bold text-navy-800">
                  Key Features
                </h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neon-100">
                        <Check className="h-3 w-3 text-neon-600" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div>
            {product.what_is_included && product.what_is_included.length > 0 && (
              <div className="card-premium p-6">
                <h3 className="text-lg font-bold text-navy-800">
                  🎁 What&apos;s Included
                </h3>
                <ul className="mt-4 space-y-3">
                  {product.what_is_included.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="badge-navy">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Previews */}
        {product.preview_urls && product.preview_urls.length > 1 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-navy-800">Preview</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
              {product.preview_urls.map((url, i) => (
                <div
                  key={url + i}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100"
                >
                  <Image
                    src={url}
                    alt={`${product.title} preview ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <h2 className="text-2xl font-bold text-navy-800">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-gray-500">
              Everything you need to know before buying. Still unsure? Email us
              at streetpandacyber@gmail.com.
            </p>
          </div>
          <FaqAccordion items={FAQS} />
        </div>

        {/* Reviews */}
        <ProductReviews
          productId={product.id}
          reviews={reviews}
          averageRating={product.average_rating ?? 4.8}
          reviewCount={product.review_count ?? reviews.length}
        />

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-navy-800">You May Also Like</h2>
            <div className="mt-6 flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              {related.map((p) => (
                <div key={p.id} className="w-80 shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
