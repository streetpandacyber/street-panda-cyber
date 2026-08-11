import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string | null;
  discount: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      discount: 0,

      addItem: (product) => {
        const existing = get().items.find((i) => i.id === product.id);
        if (existing) {
          set({ isOpen: true });
          return;
        }
        set({
          items: [...get().items, { id: product.id, product, quantity: 1 }],
          isOpen: true,
        });
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.id !== productId) }),

      clearCart: () =>
        set({ items: [], couponCode: null, discount: 0 }),

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),

      applyCoupon: (code, discount) =>
        set({ couponCode: code, discount }),

      removeCoupon: () => set({ couponCode: null, discount: 0 }),

      isInCart: (productId) =>
        get().items.some((i) => i.id === productId),

      getTotalItems: () => get().items.length,

      getSubtotal: () =>
        get().items.reduce(
          (sum, item) =>
            sum +
            (item.product.sale_price ?? item.product.price) * item.quantity,
          0
        ),

      getTotal: () =>
        Math.max(0, get().getSubtotal() - get().discount),
    }),
    {
      name: "jm-majiwa-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
