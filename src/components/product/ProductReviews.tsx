"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import type { Review } from "@/types";
import { StarRating } from "./StarRating";
import { ReviewForm } from "./ReviewForm";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

const PAGE_SIZE = 5;

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

/** Rating breakdown + paginated review list + verified-purchase review form. */
export function ProductReviews({
  productId,
  reviews,
  averageRating,
  reviewCount,
}: ProductReviewsProps) {
  const [page, setPage] = useState(0);
  const [purchaser, setPurchaser] = useState<null | boolean>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => Math.round(r.rating) === stars).length,
  }));

  // Is the signed-in user a verified purchaser?
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setPurchaser(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          if (!cancelled) setPurchaser(false);
          return;
        }
        const { data } = await supabase
          .from("order_items")
          .select("id, orders!inner(user_id, payment_status)")
          .eq("product_id", productId)
          .eq("orders.user_id", userData.user.id);
        const rows = (data ?? []) as unknown as Array<{
          orders: { payment_status: string } | Array<{ payment_status: string }>;
        }>;
        const bought = rows.some((row) =>
          Array.isArray(row.orders)
            ? row.orders.some((o) => o.payment_status === "paid")
            : row.orders.payment_status === "paid"
        );
        if (!cancelled) setPurchaser(bought);
      } catch {
        if (!cancelled) setPurchaser(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, reloadKey]);

  const pages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const visible = reviews.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="mt-16" id="reviews">
      <h2 className="text-2xl font-bold text-navy-800">Customer Reviews</h2>

      <div className="mt-6 grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* breakdown */}
        <div className="card-premium h-fit p-6">
          <div className="flex items-end gap-2">
            <span className="text-5xl font-extrabold text-navy-800">
              {averageRating.toFixed(1)}
            </span>
            <div className="pb-1.5">
              <StarRating rating={averageRating} />
              <p className="mt-1 text-xs text-gray-500">{reviewCount} verified reviews</p>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {breakdown.map((row) => {
              const pct =
                reviews.length > 0
                  ? Math.round((row.count / reviews.length) * 100)
                  : 0;
              return (
                <div key={row.stars} className="flex items-center gap-2 text-xs">
                  <span className="flex w-8 items-center gap-0.5 font-semibold text-navy-800">
                    {row.stars} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-yellow-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-9 text-right text-gray-500">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* list + form */}
        <div className="space-y-4">
          {visible.length === 0 && (
            <p className="rounded-3xl bg-gray-50 p-8 text-center text-sm text-gray-500">
              No reviews yet — be the first after your purchase!
            </p>
          )}
          {visible.map((review) => (
            <div key={review.id} className="card-premium p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-600 text-sm font-bold text-white">
                    {(review.profile?.full_name ?? "Verified Customer")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-navy-800">
                      {review.profile?.full_name ?? "Verified Customer"}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                  </div>
                </div>
                {review.is_verified && <span className="badge-neon">✓ Verified Purchase</span>}
              </div>
              <div className="mt-3">
                <StarRating rating={review.rating} />
              </div>
              {review.title && (
                <h4 className="mt-2 font-bold text-navy-800">{review.title}</h4>
              )}
              {review.comment && (
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{review.comment}</p>
              )}
            </div>
          ))}

          {/* pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-secondary !px-4 !py-2 text-xs disabled:opacity-40"
              >
                ← Previous
              </button>
              <span className="text-xs font-bold text-gray-500">
                Page {page + 1} of {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                disabled={page >= pages - 1}
                className="btn-secondary !px-4 !py-2 text-xs disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}

          {/* review form — verified purchasers only */}
          {purchaser === true && (
            <ReviewForm productId={productId} onSubmitted={() => setReloadKey((k) => k + 1)} />
          )}
          {purchaser === false && (
            <p className="rounded-3xl bg-gray-50 p-6 text-center text-sm text-gray-500">
              🔒 Reviews are limited to verified purchasers. Buy this product and
              your review form unlocks automatically.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
