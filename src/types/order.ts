export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  bundle_id?: string;
  title: string;
  price: number;
  quantity: number;
  download_count: number;
  max_downloads: number;
  product?: import("./product").Product;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  payment_method: string;
  payment_status: PaymentStatus;
  mpesa_transaction_id?: string;
  mpesa_phone?: string;
  coupon_id?: string;
  status: OrderStatus;
  download_token?: string;
  download_expires_at?: string;
  order_items?: OrderItem[];
  created_at: string;
  updated_at: string;
}
