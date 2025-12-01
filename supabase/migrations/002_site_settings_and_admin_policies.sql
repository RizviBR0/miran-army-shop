-- ================================================
-- Site Settings Table Migration
-- ================================================

-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'main',
    site_name TEXT DEFAULT 'Miran Army',
    site_description TEXT DEFAULT 'The #1 Fan Community - Official AliExpress Affiliate Store',
    logo_url TEXT,
    favicon_url TEXT,
    hero_title TEXT DEFAULT 'Miran Army – The #1 Fan Community',
    hero_subtitle TEXT DEFAULT 'Support your faves with our exclusive merch drops. New arrivals every week!',
    hero_image_url TEXT,
    announcement_text TEXT DEFAULT '🎉 FREE shipping on orders over $50!',
    announcement_enabled BOOLEAN DEFAULT true,
    footer_text TEXT DEFAULT '© 2025 Miran Army. All rights reserved. We are not affiliated with any artists. Prices and availability subject to change.',
    social_instagram TEXT,
    social_tiktok TEXT,
    social_youtube TEXT,
    contact_email TEXT,
    shipping_info TEXT DEFAULT 'Most items ship directly from our partner sellers. Delivery typically takes 15-30 business days.',
    return_policy TEXT DEFAULT 'Returns are handled by individual sellers. Please contact the seller directly for return requests.',
    affiliate_disclosure TEXT DEFAULT 'As an AliExpress affiliate, we earn from qualifying purchases. Product prices may vary.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow everyone to read settings
CREATE POLICY "Allow public read access to site_settings" ON public.site_settings
    FOR SELECT USING (true);

-- Allow admin to update settings (need to check admin role in your auth setup)
-- For now, we'll allow updates from anyone authenticated
CREATE POLICY "Allow admin update access to site_settings" ON public.site_settings
    FOR UPDATE USING (true);

CREATE POLICY "Allow admin insert access to site_settings" ON public.site_settings
    FOR INSERT WITH CHECK (true);

-- Insert default settings row if it doesn't exist
INSERT INTO public.site_settings (id) VALUES ('main')
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- Products Table Enhancement
-- ================================================

-- Add missing columns to products table if they don't exist
DO $$ BEGIN
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge TEXT;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price NUMERIC(10, 2);
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Create index for category_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);

-- ================================================
-- Categories Enhancement
-- ================================================

-- Add image_url to categories if it doesn't exist
DO $$ BEGIN
    ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url TEXT;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- ================================================
-- RLS Policies for Products (Admin CRUD)
-- ================================================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Allow public read access to active products" ON public.products;
DROP POLICY IF EXISTS "Allow admin full access to products" ON public.products;

-- Create new policies
CREATE POLICY "Allow public read access to active products" ON public.products
    FOR SELECT USING (status = 'ACTIVE' OR status = 'DRAFT');

CREATE POLICY "Allow admin insert products" ON public.products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin update products" ON public.products
    FOR UPDATE USING (true);

CREATE POLICY "Allow admin delete products" ON public.products
    FOR DELETE USING (true);

-- ================================================
-- RLS Policies for Categories (Admin CRUD)
-- ================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin full access to categories" ON public.categories;

-- Create new policies
CREATE POLICY "Allow public read access to categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert categories" ON public.categories
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin update categories" ON public.categories
    FOR UPDATE USING (true);

CREATE POLICY "Allow admin delete categories" ON public.categories
    FOR DELETE USING (true);
