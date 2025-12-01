-- Migration: Add AliExpress-specific fields to products table
-- These fields store the full product data from AliExpress affiliate exports

-- Add new columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS positive_feedback DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS coupon_value TEXT,
ADD COLUMN IF NOT EXISTS coupon_min_spend TEXT,
ADD COLUMN IF NOT EXISTS coupon_end_date TIMESTAMPTZ;

-- Add indexes for sorting/filtering
CREATE INDEX IF NOT EXISTS idx_products_discount_percent ON products(discount_percent DESC);
CREATE INDEX IF NOT EXISTS idx_products_sales_count ON products(sales_count DESC);
CREATE INDEX IF NOT EXISTS idx_products_positive_feedback ON products(positive_feedback DESC);

-- Comment on columns for documentation
COMMENT ON COLUMN products.original_price IS 'Original price before discount';
COMMENT ON COLUMN products.discount_percent IS 'Discount percentage (e.g., 8 for 8%)';
COMMENT ON COLUMN products.sales_count IS 'Number of sales in last 180 days';
COMMENT ON COLUMN products.positive_feedback IS 'Positive feedback percentage';
COMMENT ON COLUMN products.video_url IS 'Product video URL from AliExpress';
COMMENT ON COLUMN products.coupon_code IS 'Active coupon code name';
COMMENT ON COLUMN products.coupon_value IS 'Coupon discount value';
COMMENT ON COLUMN products.coupon_min_spend IS 'Minimum spend for coupon';
COMMENT ON COLUMN products.coupon_end_date IS 'Coupon expiration date';
