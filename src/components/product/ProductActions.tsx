"use client";

import { useState } from "react";
import { Check, Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { cn } from "@/lib/utils";

export function ProductActions({ product }: { product: Product }) {
  const { addItem, isInCart, openCart } = useCartStore();
  const { isWishlisted, toggleItem } = useWishlistStore();
  const [justAdded, setJustAdded] = useState(false);

  const inCart = isInCart(product.id);
  const wishlisted = isWishlisted(product.id);

  const handleBuy = () => {
    if (inCart) {
      openCart();
      return;
    }
    addItem(product);
    setJustAdded(true);
    toast.success("Added to cart!");
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button onClick={handleBuy} className="btn-primary flex-1 !py-4">
        {justAdded ? (
          <>
            <Check className="h-5 w-5" /> Added!
          </>
        ) : inCart ? (
          <>
            <Check className="h-5 w-5" /> In Cart — Open Cart
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" /> Buy Now
          </>
        )}
      </button>
      <button
        onClick={() => {
          toggleItem(product.id);
          toast.success(
            wishlisted ? "Removed from wishlist" : "Saved to wishlist ❤️"
          );
        }}
        className={cn(
          "btn-secondary !px-6",
          wishlisted && "!border-red-200 !bg-red-50 !text-red-500"
        )}
        aria-label="Toggle wishlist"
      >
        <Heart className={cn("h-5 w-5", wishlisted && "fill-current")} />
        {wishlisted ? "Saved" : "Wishlist"}
      </button>
    </div>
  );
}
