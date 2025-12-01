# Copilot Project Instructions – Miran Army

You are helping build **Miran Army – The #1 Fan Community**, a playful AliExpress affiliate website inspired by Korean viral baby / meme vibes (like Jinmiran / Rohee), but **not officially affiliated** with them.

- **Brand name:** Miran Army – The #1 Fan Community  
- **Primary domain:** `https://miranarmy.store`  
- **Goal:** Curate cute / fun AliExpress products, show them in a modern, playful UI, and send users to AliExpress via affiliate links.  
- **Monetization:** AliExpress affiliate program.

The site has:

- A **dashboard at the base URL** (`/` → miranarmy.store)  
- A dedicated **shop page at `/shop`** with products, filters, and location-aware shipping  
- An optional **email-OTP login** so users can save favorites (no password)  
- A **hidden admin panel** for me only (`/admin`)  
- **Automatic categories** derived from product data  
- **Excel bulk import** of products  
- A **banner carousel** for hot/top products  
- **Location-based product filtering** (by country) without asking for browser geolocation permission  
- **Badges** for free shipping and “ships to your country”  
- Modern UI using **ShadCN UI** and **Aceternity UI** components  
- Fully **responsive** layout across mobile, tablet, and desktop  

Keep everything **cute, modern, fast, and clean**.

---

## 1. Tech Stack

Default stack (unless files clearly demand otherwise):

- **Framework:** Next.js 14 with **App Router** (`app/` directory)
- **Language:** TypeScript everywhere
- **Styling:** Tailwind CSS
- **Component libraries:**
  - **ShadCN UI** (Radix based) for inputs, buttons, dialogs, dropdowns, tabs, etc.
  - **Aceternity UI** sections/components for modern hero, cards, and layout patterns where appropriate.
- **Database:** Supabase Postgres  
  - You MAY use Prisma ORM for typed access to Supabase DB.
- **Auth (users):** Supabase Auth with **email OTP** (no passwords).
- **Admin auth:** Separate admin login (email + password, hashed with bcrypt and role-based access).
- **Deployment target:** Vercel (assume access to geolocation-related headers).

Code style: functional React components, server components by default, client components only for interactive pieces (carousels, filters, modals, forms, favorites button).

---

## 2. Brand, Logos & Visual Style

### 2.1 Logos

- There are two logo files already present in a `logo/` folder at the project root.
- You MAY move/copy them to a more appropriate location for usage, such as:
  - `public/logo/` or
  - `public/` (e.g. `public/logo-light.png`, `public/logo-dark.png`).
- Update all import paths accordingly when you move assets.
- Use:
  - Main logo in the navbar and landing hero.
  - Simplified mark or same logo for favicon / social previews if appropriate.

### 2.2 Overall vibe

- Cute, fun, “fan community” energy.
- Rounded shapes, soft edges, chunky buttons, micro-animations.
- Flat-modern with playful touches (no heavy skeuomorphism).
- Avoid shipping real photos of recognizable children in code; use **generic cute illustrations, icons, or placeholders**.

### 2.3 Colors

Base brand colors (from existing logo):

- **Brand yellow:** `#FFFF00`  
- **Brand black:** `#121212`

Use these carefully to avoid eye strain:

- Do **not** use `#FFFF00` as full-page background.
- Use `#FFFF00` primarily for:
  - Accent elements,
  - Primary button backgrounds,
  - Badges,
  - Small highlights.
- Use `#121212` for:
  - Primary text on light surfaces,
  - Dark sections (with enough padding and contrast).

Complementary supporting palette (choose soft, low-strain colors):

- `bg-main` (overall background): `#F9FAFB`
- `bg-elevated` (cards): `#FFFFFF`
- `accent-pink`: `#FF66B3`
- `accent-soft-pink`: `#FFE3F1`
- `border-subtle`: `#E5E7EB`
- `text-main`: `#111827`
- `text-muted`: `#6B7280`
- `badge-neutral-bg`: `#F3F4F6`

Guidelines:

- Use `bg-main` for page background.
- Use `bg-elevated` with soft shadow and rounded corners for cards.
- Use `#FFFF00` sparingly for CTAs, icon accents, and thin strips/badges so the UI feels energetic but not visually overwhelming.
- Ensure WCAG contrast is acceptable, especially for text on yellow:
  - Prefer dark text on yellow (`#121212` on `#FFFF00`).
  - Avoid yellow text on white or light backgrounds.

Configure Tailwind theme accordingly in `tailwind.config.ts`.

### 2.4 Typography – custom playful fonts

Use **Google Fonts** via `next/font`:

- Headings: `"Fredoka"` or `"Baloo 2"` (playful rounded).
- Body: `"Nunito"` or `"Inter"` (legible and low-strain).

In `app/layout.tsx`:

- Import heading and body fonts with `next/font/google`.
- Apply:
  - Body font to `<body>`.
  - Heading font to `h1`, `h2`, `h3` via Tailwind utilities / global styles.

Use `display: 'swap'` so fonts don’t block first paint.

### 2.5 Component libraries usage

- **ShadCN UI**
  - Use for buttons, inputs, dropdowns, select, dialog, sheet, tabs, badges, forms.
  - Configure variants (primary, secondary, ghost) to use the brand colors and neutrals described above.
- **Aceternity UI**
  - Use for hero sections, card layouts, hover effects, timeline or marquee sections where it makes sense.
  - Adapt styling to the Miran Army palette and typography.

Ensure both libraries feel cohesive as a single design system.

---

## 3. Routing & Page Structure

### 3.1 Routes overview

- `/` → **Dashboard / Landing** (community-style overview with CTA to shop)
- `/shop` → **Main shop** (all products, filters, location-aware shipping)
- `/category/[slug]` → Category-specific product listing
- `/favorites` → User favorites (requires email-OTP login)
- `/admin` → Admin panel root (protected)
  - `/admin/products`
  - `/admin/products/import`
  - `/admin/categories`
  - `/admin/settings`
- API routes under `app/api/...` for auth, favorites, imports, etc.

### 3.2 `/` – Miran Army dashboard / landing

Purpose: feel like a **fan community dashboard** and an entry point to `/shop`.

Sections:

1. **Header / Navbar**
   - Logo: use logo from `public/logo/...` or equivalent.
   - Links: Dashboard, Shop, Favorites.
   - Right side: Country selector (small dropdown) + optional auth status indicator.

2. **Hero section (Aceternity style)**
   - Title: “Miran Army – The #1 Fan Community”.
   - Short subtitle about cute AliExpress finds for fans.
   - CTA buttons:
     - Primary: “Enter the Shop” → `/shop` (bright yellow button with dark text).
     - Secondary: e.g. “View Today’s Picks” → `/shop?sort=today` (outlined or soft accent).

3. **Featured / Hot picks preview**
   - Grid or small carousel of `isHot` or `isFeatured` products.
   - Clicking a product takes user to `/shop` with that product visible.

4. **Category highlights**
   - A few category cards (Aceternity-inspired) with illustration + CTA to `/category/[slug]`.

5. **Community flavor**
   - Optional: “What Miran Army is loving this week” with top-clicked or curated products.

### 3.3 `/shop` – Main Shop Page

Sections:

1. **Shop header**
   - Title: “Shop Miran Army Picks”.
   - Subtitle: mention curated AliExpress items.

2. **Banner carousel (top of shop)**
   - Shows products with `isHot = true`.
   - Each slide:
     - Large product image.
     - Short playful headline.
     - Optional subtitle.
     - “View deal” button → product detail / AliExpress link.
   - Implement via Aceternity-style hero/slider or a minimal custom carousel using `next/image` with lazy loading.

3. **Filter bar**
   - Search input (by product title; debounce input).
   - Category dropdown (ShadCN `Select`) + optional horizontal category pills.
   - Location dropdown:
     - Shows current country (from cookie or IP).
     - Allows user to override.
   - Sort dropdown:
     - `Newest`.
     - `Price (low → high)`.
     - `Price (high → low)`.
     - Optional `Trending`.

4. **Product grid**
   - Responsive layout:
     - Mobile: 2 columns.
     - Tablet: 3 columns.
     - Desktop: 4+ columns where space allows.
   - Each `ProductCard`:
     - Product image (`next/image`).
     - Title (1–2 lines).
     - Price + currency.
     - Badges:
       - `Free shipping` if `ProductShipping` has `isFree = true` for current country or `ALL`.
       - `Ships to you` if current country or `ALL` is in shipping list.
       - If not shipping to user, card slightly muted and text “May not ship to your country”.
     - Small `AliExpress` chip/badge.
     - Heart icon:
       - Not logged in → opens email-OTP modal.
       - Logged in → toggles favorite state.

5. **Pagination**
   - Cursor-based pagination or “Load more” button.
   - Avoid loading all products at once.

### 3.4 `/category/[slug]` – Category Page

- Top banner:
  - Category icon (emoji or icon).
  - Title (category name).
  - Short description.
- Same filter bar as `/shop` but category pre-selected / locked.
- Same product grid with location-aware shipping and badges.

### 3.5 `/favorites` – Favorites Page

- If user **not logged in**:
  - Cute empty state.
  - CTA: “Sign in with email to see your Miran Army favorites”.
  - Opens email-OTP modal.

- If **logged in**:
  - Grid of `Favorite` products.
  - Heart to remove from favorites.

### 3.6 `/admin` – Admin Panel

- Uses ShadCN layout (sidebar + main content).
- Sidebar: Dashboard, Products, Categories, Import, Settings.
- Protected by admin auth (`User.role = ADMIN`).

---

## 4. Location & Shipping Logic (No Browser Permission)

### 4.1 No HTML5 geolocation

- Do **not** use `navigator.geolocation`.
- Use **IP-based geolocation** on the server:
  - On Vercel, use headers like:
    - `x-vercel-ip-country` (ISO-2 country code).
- Implement a helper or middleware that:
  - Reads `miranarmy_country` cookie if present.
  - Else uses `x-vercel-ip-country`.
  - Else falls back to a safe default (e.g. `US` or a “Global” mode).

### 4.2 Filtering by location

- Each product has associated shipping info:
  - Supported countries.
  - Free-shipping subset.

- For `currentCountry`:
  - Show products where any `ProductShipping.countryCode`:
    - Equals `currentCountry`, or
    - Equals `'ALL'`.
  - Badges:
    - `Free shipping` if `isFree = true` for `currentCountry` or `'ALL'`.
    - `Ships to you` if shipping row exists for `currentCountry` or `'ALL'`.
    - Else: text “May not ship to your country” and slightly muted card.

- Location dropdown:
  - Lists supported countries (from DB or static list).
  - On change:
    - Sets `miranarmy_country` cookie.
    - Refreshes filters.

---

## 5. Data Model (Prisma-like, on Supabase)

Use Supabase Postgres; Prisma model as reference:

```ts
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  role      UserRole @default(USER) // USER or ADMIN
  password  String?  // hashed password for admin users only
  favorites Favorite[]
  country   String?  // optional preferred country (ISO code)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum UserRole {
  USER
  ADMIN
}

model EmailVerificationCode {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  code      String   // 6-digit
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}

model Category {
  id          String          @id @default(cuid())
  name        String
  slug        String          @unique
  description String?
  icon        String?         // emoji like "🧴"
  color       String?
  sortOrder   Int             @default(0)
  products    ProductCategory[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

model Product {
  id            String            @id @default(cuid())
  externalId    String?           @unique // AliExpress ID
  title         String
  shortDesc     String?
  imageUrl      String
  aliUrl        String            // original AliExpress URL
  affiliateUrl  String            // tracked URL
  price         Float?
  currency      String?           // e.g. "USD"
  rating        Float?
  storeName     String?
  isHot         Boolean           @default(false)  // for banner
  isFeatured    Boolean           @default(false)  // for dashboard/shop highlights
  status        ProductStatus     @default(ACTIVE)
  shipping      ProductShipping[]
  categories    ProductCategory[]
  favorites     Favorite[]
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
}

enum ProductStatus {
  ACTIVE
  DRAFT
  ARCHIVED
}

model ProductCategory {
  product    Product  @relation(fields: [productId], references: [id])
  productId  String
  category   Category @relation(fields: [categoryId], references: [id])
  categoryId String

  @@id([productId, categoryId])
}

model ProductShipping {
  id          String   @id @default(cuid())
  product     Product  @relation(fields: [productId], references: [id])
  productId   String
  countryCode String   // ISO-2 code like "US", "BD", or "ALL" for worldwide
  isFree      Boolean  @default(false)
  note        String?
}

model Favorite {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  product   Product  @relation(fields: [productId], references: [id])
  productId String
  createdAt DateTime @default(now())
}