import type { CartItem } from "@/types";
import { formatPrice } from "@/lib/utils";

interface OrderSummaryCardProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  total: number;
  showItems?: boolean;
}

/** Reusable order summary used by the cart and checkout pages. */
export function OrderSummaryCard({
  items,
  subtotal,
  discount,
  couponCode,
  total,
  showItems = true,
}: OrderSummaryCardProps) {
  return (
    <div className="card-premium p-6">
      <h3 className="text-lg font-bold text-navy-800">Order Summary</h3>

      {showItems && items.length > 0 && (
        <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 text-sm">
              <span className="line-clamp-1 text-gray-600">
                {item.product.title}
              </span>
              <span className="shrink-0 font-semibold text-navy-800">
                {formatPrice(item.product.sale_price ?? item.product.price)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between font-semibold text-neon-600">
            <span>Discount{couponCode ? ` (${couponCode})` : ""}</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="rounded-xl bg-neon-50 px-3 py-2 text-xs font-bold text-neon-700">
            🎉 You save {formatPrice(discount)}
          </div>
        )}
        <div className="flex justify-between border-t border-gray-100 pt-3 text-lg font-extrabold text-navy-800">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
