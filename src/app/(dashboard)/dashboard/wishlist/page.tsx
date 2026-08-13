"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Heart, Share2, ShoppingBag } from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/data/mock";
import Image from "next/image";
import { useWishlistStore } from "@/store/wishlistStore";
import { useDashboard } from "@/components/dashboard/useDashboard";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

export default function WishlistPage() {
  const { configured, user } = useDashboard();
  const { items: localIds, removeItem, addItem } = useWishlistStore();
  const cartAdd = useCartStore((s) => s.addItem);
  const [dbProducts, setDbProducts] = useState<Product[] | null>(null);

  // Sync: pull the DB wishlist when logged in, push any local-only items up.
  useEffect(() => {
    if (!configured || !user) return;
    (async () => {
      try {
        const res = await fetch("/api/wishlist");
        const data = await res.json();
        const dbRows: { product_id: string; products?: Product }[] = data.data ?? [];
        const dbIds = dbRows.map((r) => r.product_id);
        setDbProducts(
          dbRows.map((r) => r.products ?? MOCK_PRODUCTS.find((p) => p.id === r.product_id)).filter(Boolean) as Product[]
        );
        // push local-only items to the database
        for (const id of localIds) {
          if (!dbIds.includes(id)) {
            await fetch("/api/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ product_id: id }),
            }).catch(() => undefined);
          }
        }
        // pull db-only items into the local store (for cart badges etc.)
        for (const id of dbIds) {
          if (!localIds.includes(id)) addItem(id);
        }
      } catch {
        setDbProducts(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, user]);

  const products =
    configured && user && dbProducts
      ? dbProducts
      : MOCK_PRODUCTS.filter((p) => localIds.includes(p.id));

  const remove = async (id: string) => {
    removeItem(id);
    if (configured && user) {
      await fetch(`/api/wishlist?product_id=${id}`, { method: "DELETE" }).catch(() => undefined);
    }
    toast.success("Removed from wishlist");
  };

  const addToCart = (p: Product) => {
    cartAdd(p);
    toast.success(`Added “${p.title}” to cart`);
  };

  const share = async () => {
    const url = `${window.location.origin}/marketplace`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My JM Majiwa wishlist",
          text: `Check out the ${products.length} products on my JM Majiwa wishlist!`,
          url,
        });
        return;
      }
      throw new Error("no-share");
    } catch {
      await navigator.clipboard?.writeText(
        `${url} — my JM Majiwa wishlist: ${products.map((p) => p.title).join(", ")}`
      );
      toast.success("Wishlist copied to clipboard 🔗");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-800 md:text-3xl">My Wishlist</h1>
          <p className="mt-1 text-gray-500">
            {products.length} saved product{products.length === 1 ? "" : "s"}
            {configured && user ? " • synced to your account" : ""}
          </p>
        </div>
        {products.length > 0 && (
          <button onClick={share} className="btn-secondary !py-2.5 text-sm">
            <Share2 className="h-4 w-4" /> Share Wishlist
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="card-premium flex flex-col items-center gap-4 p-14 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
            <Heart className="h-8 w-8 text-orange-400" />
          </span>
          <h2 className="text-lg font-bold text-navy-800">Your wishlist is empty</h2>
          <p className="max-w-sm text-sm text-gray-500">
            Tap the heart on any product to save it here for later.
          </p>
          <Link href="/marketplace" className="btn-primary">
            <ShoppingBag className="h-4 w-4" /> Discover Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="card-premium flex h-full flex-col overflow-hidden">
              <Link href={`/products/${p.slug}`} className="relative block aspect-[4/3] bg-gray-100">
                {p.thumbnail_url && (
                  <Image src={p.thumbnail_url} alt={p.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                )}
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <Link href={`/products/${p.slug}`} className="line-clamp-2 font-bold text-navy-800 hover:text-orange-600">
                  {p.title}
                </Link>
                <p className="mt-2 text-lg font-extrabold text-navy-800">
                  {formatPrice(p.sale_price ?? p.price)}
                  {p.sale_price !== undefined && (
                    <span className="ml-2 text-xs font-medium text-gray-400 line-through">{formatPrice(p.price)}</span>
                  )}
                </p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => addToCart(p)} className="btn-primary flex-1 !px-3 !py-2.5 text-xs">
                    <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-red-500 shadow-soft-md transition-colors hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
