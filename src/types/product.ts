export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image_url?: string;
  color?: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string;
  short_description?: string;
  category_id?: string;
  category?: Category;
  price: number;
  sale_price?: number;
  currency: string;
  thumbnail_url?: string;
  gallery_urls?: string[];
  preview_urls?: string[];
  file_url?: string;
  file_size?: string;
  file_format?: string;
  tags?: string[];
  features?: string[];
  what_is_included?: string[];
  is_published: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new: boolean;
  total_downloads: number;
  total_sales: number;
  view_count: number;
  average_rating?: number;
  review_count?: number;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface Bundle {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
  original_price: number;
  bundle_price: number;
  currency: string;
  is_published: boolean;
  is_featured: boolean;
  products?: Product[];
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
  profile?: {
    full_name: string;
    avatar_url?: string;
  };
}
