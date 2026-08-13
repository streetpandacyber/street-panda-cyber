export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  country: string;
  city?: string;
  bio?: string;
  is_admin: boolean;
  newsletter_subscribed: boolean;
  created_at: string;
  updated_at: string;
}
