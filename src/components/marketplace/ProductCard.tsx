"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Eye, Heart, ShoppingCart, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { calculateDiscount, cn, formatPrice } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addItem, isInCart, openCart } = useCartStore();
  const { isWishlisted, toggleItem } = useWishlistStore();
  const [justAdded, setJustAdded] = useState(false);

  const price = product.sale_price ?? product.price;
  const onSale =
    product.sale_price !== undefined && product.sale_price < product.price;
  const inCart = isInCart(product.id);
  const wishlisted = isWishlisted(product.id);

  const handleAdd = () => {
    if (inCart) {
      openCart();
      return;
    }
    addItem(product);
    setJustAdded(true);
    toast.success("Added to cart!");
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleWishlist = () => {
    toggleItem(product.id);
    toast.success(wishlisted ? "Removed from wishlist" : "Saved to wishlist ❤️");
  };

  return (
    <div className="card-premium group relative flex h-full flex-col overflow-hidden">
      {/* Thumbnail */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-gray-100"
      >
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-5xl">
            📦
          </span>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {onSale && (
            <span className="badge bg-red-500 text-white shadow-soft-sm">
              -{calculateDiscount(product.price, product.sale_price!)}%
            </span>
          )}
          {product.is_best_seller && (
            <span className="badge bg-orange-500 text-white shadow-soft-sm">
              🔥 Best Seller
            </span>
          )}
          {product.is_new && (
            <span className="badge bg-neon-400 text-navy-900 shadow-soft-sm">
              ✨ New
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            handleWishlist();
          }}
          aria-label="Toggle wishlist"
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-soft-md transition-all duration-300",
            wishlisted
              ? "bg-red-500 text-white"
              : "bg-white/90 text-gray-500 opacity-0 hover:text-red-500 group-hover:opacity-100"
          )}
        >
          <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
        </button>

        {/* Quick view overlay */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-navy-950/70 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-1.5 text-xs font-bold text-navy-800">
            <Eye className="h-3.5 w-3.5" /> Quick View
          </span>
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-orange-600">
            {product.category?.name ?? "Digital Product"}
          </span>
          <span className="badge-neon !gap-1 !px-2 !py-0.5">
            <Zap className="h-3 w-3" /> Instant
          </span>
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-navy-800 transition-colors hover:text-orange-600">
            {product.title}
          </h3>
        </Link>
        {product.short_description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">
            {product.short_description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <strong className="text-navy-800">
              {product.average_rating?.toFixed(1) ?? "4.8"}
            </strong>
            ({product.review_count ?? 0})
          </span>
          <span>•</span>
          <span>{product.total_sales.toLocaleString()} sales</span>
        </div>

        {/* Price + CTA */}
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-gray-100 pt-4">
          <div>
            <p className="text-xl font-extrabold text-navy-800">
              {formatPrice(price, product.currency)}
            </p>
            {onSale && (
              <p className="text-xs text-gray-400 line-through">
                {formatPrice(product.price, product.currency)}
              </p>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={cn(
              "btn-primary !px-4 !py-2.5 text-sm",
              (inCart || justAdded) && "!bg-neon-500 hover:!bg-neon-500"
            )}
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" /> Added!
              </>
            ) : inCart ? (
              <>
                <Check className="h-4 w-4" /> In Cart
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" /> Buy Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
