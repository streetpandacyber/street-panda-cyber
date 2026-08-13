export * from "./product";
export * from "./order";
export * from "./user";

export interface CartItem {
  id: string;
  product: import("./product").Product;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  minimum_order: number;
  maximum_discount?: number;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  cover_image_url?: string;
  author_id?: string;
  category?: string;
  tags?: string[];
  is_published: boolean;
  is_featured: boolean;
  meta_title?: string;
  meta_description?: string;
  view_count: number;
  read_time?: number;
  published_at?: string;
  author_name?: string;
  author_bio?: string;
  author_avatar_url?: string;
  created_at: string;
  updated_at: string;
}
