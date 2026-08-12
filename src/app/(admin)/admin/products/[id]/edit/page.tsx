"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Product } from "@/types";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/products/${params.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Product not found");
        setProduct(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="animate-pulse text-3xl">⏳</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/60">
        {error ?? "Product not found"}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Product"
        subtitle={`Editing “${product.title}”`}
      />
      <div className="mt-6">
        <ProductForm initial={product} editId={product.id} />
      </div>
    </div>
  );
}
