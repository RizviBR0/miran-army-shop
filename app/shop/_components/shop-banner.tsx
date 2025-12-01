"use client";

import { BannerCarousel } from "@/components/ui/aceternity/banner-carousel";

// Mock hot products for banner - will be replaced with Supabase data
const hotProducts = [
  {
    id: "1",
    title: "New Arrival: Super Cute Plush Collection! 🧸",
    subtitle: "Limited time: Get 20% off on selected items",
    imageUrl: "https://picsum.photos/seed/banner1/1200/400",
    href: "#",
    cta: "Shop Now",
  },
  {
    id: "2",
    title: "Kawaii Sticker Packs Are Back! 📝",
    subtitle: "Over 50 designs to choose from",
    imageUrl: "https://picsum.photos/seed/banner2/1200/400",
    href: "#",
    cta: "View Collection",
  },
  {
    id: "3",
    title: "Fan Favorites: Best Sellers of the Week ⭐",
    subtitle: "See what other Miran Army members are loving",
    imageUrl: "https://picsum.photos/seed/banner3/1200/400",
    href: "#",
    cta: "Explore",
  },
];

export function ShopBanner() {
  return <BannerCarousel items={hotProducts} />;
}
