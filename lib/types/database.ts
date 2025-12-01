// ============================
// Database Types for Miran Army
// ============================

export type UserRole = "USER" | "ADMIN";
export type ProductStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

// ============================
// Database Models
// ============================

export interface User {
  id: string;
  email: string;
  role: UserRole;
  password?: string | null; // Only for admin users
  country?: string | null; // ISO country code
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null; // Emoji like "🧴"
  color?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  external_id?: string | null; // AliExpress ID
  title: string;
  short_desc?: string | null;
  image_url: string;
  ali_url: string; // Original AliExpress URL
  affiliate_url: string; // Tracked URL
  price?: number | null;
  original_price?: number | null; // Price before discount
  currency?: string | null;
  discount_percent?: number | null; // Discount % (e.g., 8 for 8%)
  sales_count?: number | null; // Sales in last 180 days
  positive_feedback?: number | null; // Positive feedback % (e.g., 94.3)
  rating?: number | null;
  video_url?: string | null;
  store_name?: string | null;
  is_hot: boolean;
  is_featured: boolean;
  status: ProductStatus;
  // Coupon info
  coupon_code?: string | null;
  coupon_value?: string | null;
  coupon_min_spend?: string | null;
  coupon_end_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  product_id: string;
  category_id: string;
}

export interface ProductShipping {
  id: string;
  product_id: string;
  country_code: string; // ISO-2 code or "ALL"
  is_free: boolean;
  note?: string | null;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

// ============================
// Extended Types with Relations
// ============================

export interface ProductWithDetails extends Product {
  categories?: Category[];
  shipping?: ProductShipping[];
}

export interface CategoryWithProducts extends Category {
  products?: Product[];
  product_count?: number;
}

// ============================
// API Response Types
// ============================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
}

// ============================
// Filter Types
// ============================

export interface ProductFilters {
  search?: string;
  category?: string;
  country?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "trending";
  page?: number;
  limit?: number;
}

// ============================
// Country Data
// ============================

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_COUNTRIES: Country[] = [
  { code: "ALL", name: "Worldwide", flag: "🌍" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
];

export const getCountryByCode = (code: string): Country | undefined => {
  return SUPPORTED_COUNTRIES.find((c) => c.code === code);
};
