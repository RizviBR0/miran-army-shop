-- ================================================
-- AliExpress Categories Migration
-- ================================================

-- Clear existing categories (be careful in production!)
-- DELETE FROM public.categories;

-- Insert AliExpress affiliate categories
INSERT INTO public.categories (name, slug, description, sort_order)
VALUES
  ('Virtual Products', 'virtual-products', 'Digital goods and virtual items', 1),
  ('Industrial & Business', 'industrial-business', 'Industrial equipment and business supplies', 2),
  ('Sports Shoes, Clothing & Accessories', 'sports-shoes-clothing-accessories', 'Athletic footwear, apparel and accessories', 3),
  ('Phones & Telecommunications Accessories', 'phones-telecom-accessories', 'Mobile phone and telecom accessories', 4),
  ('Women''s Clothing', 'womens-clothing', 'Fashion and apparel for women', 5),
  ('Men''s Clothing', 'mens-clothing', 'Fashion and apparel for men', 6),
  ('Apparel Accessories', 'apparel-accessories', 'Fashion accessories and add-ons', 7),
  ('Hair Extensions & Wigs', 'hair-extensions-wigs', 'Hair pieces, extensions and wigs', 8),
  ('Electronic Components & Supplies', 'electronic-components-supplies', 'Electronic parts and components', 9),
  ('Phones & Telecommunications', 'phones-telecommunications', 'Mobile phones and telecom devices', 10),
  ('Tools', 'tools', 'Hand tools, power tools and equipment', 11),
  ('Mother & Kids', 'mother-kids', 'Products for mothers and children', 12),
  ('Furniture', 'furniture', 'Home and office furniture', 13),
  ('Watches', 'watches', 'Watches and timepieces', 14),
  ('Luggage & Bags', 'luggage-bags', 'Travel luggage, bags and backpacks', 15),
  ('Underwear', 'underwear', 'Undergarments and intimate apparel', 16),
  ('Special Category', 'special-category', 'Special and miscellaneous items', 17),
  ('Books & Cultural Merchandise', 'books-cultural-merchandise', 'Books and cultural products', 18),
  ('Novelty & Special Use', 'novelty-special-use', 'Novelty items and special use products', 19),
  ('Motorcycle Equipments & Parts', 'motorcycle-equipments-parts', 'Motorcycle gear, equipment and parts', 20),
  ('Food', 'food', 'Food and grocery items', 21),
  ('Home Appliances', 'home-appliances', 'Household appliances and electronics', 22),
  ('Computer & Office', 'computer-office', 'Computers, laptops and office equipment', 23),
  ('Home Improvement', 'home-improvement', 'Home improvement and DIY supplies', 24),
  ('Home & Garden', 'home-garden', 'Home decor and garden supplies', 25),
  ('Sports & Entertainment', 'sports-entertainment', 'Sports gear and entertainment products', 26),
  ('Office & School Supplies', 'office-school-supplies', 'Stationery and school supplies', 27),
  ('Toys & Hobbies', 'toys-hobbies', 'Toys, games and hobby supplies', 28),
  ('Security & Protection', 'security-protection', 'Security systems and protective gear', 29),
  ('Automobiles, Parts & Accessories', 'automobiles-parts-accessories', 'Auto parts and car accessories', 30),
  ('Jewelry & Accessories', 'jewelry-accessories', 'Jewelry, watches and fashion accessories', 31),
  ('Lights & Lighting', 'lights-lighting', 'Lighting fixtures and bulbs', 32),
  ('Consumer Electronics', 'consumer-electronics', 'Electronics and gadgets', 33),
  ('Beauty & Health', 'beauty-health', 'Beauty products and health items', 34),
  ('Weddings & Events', 'weddings-events', 'Wedding supplies and event decorations', 35),
  ('Shoes', 'shoes', 'Footwear for all occasions', 36)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;
