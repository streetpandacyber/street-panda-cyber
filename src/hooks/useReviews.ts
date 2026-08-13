"use client";

import { useCallback, useEffect, useState } from "react";
import type { Review } from "@/types";

export function useReviews(productSlug?: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(Boolean(productSlug));
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${slug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load reviews");
      setReviews((data.data.reviews as Review[]) ?? []);
      return data.data.reviews as Review[];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch when a slug is provided
  useEffect(() => {
    if (productSlug) fetchReviews(productSlug);
  }, [productSlug, fetchReviews]);

  const submitReview = useCallback(
    async (payload: {
      product_id: string;
      rating: number;
      title?: string;
      comment?: string;
    }) => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit review");
      if (productSlug) await fetchReviews(productSlug);
      return data.data as Review;
    },
    [productSlug, fetchReviews]
  );

  return { reviews, loading, error, fetchReviews, submitReview };
}
