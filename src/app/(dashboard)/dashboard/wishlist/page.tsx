"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/data/mock";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { useWishlistStore } from "@/store/wishlistStore";

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const products = MOCK_PRODUCTS.filter((p) => items.includes(p.id));

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy-800 md:text-3xl">
        My Wishlist
      </h1>
      <p className="mt-1 text-gray-500">
        {products.length} saved product{products.length === 1 ? "" : "s"}
      </p>

      {products.length === 0 ? (
        <div className="card-premium mt-8 flex flex-col items-center gap-4 p-14 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
            <Heart className="h-8 w-8 text-orange-400" />
          </span>
          <h2 className="text-lg font-bold text-navy-800">
            Your wishlist is empty
          </h2>
          <p className="max-w-sm text-sm text-gray-500">
            Tap the heart on any product to save it here for later.
          </p>
          <Link href="/marketplace" className="btn-primary">
            <ShoppingBag className="h-4 w-4" /> Discover Products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
