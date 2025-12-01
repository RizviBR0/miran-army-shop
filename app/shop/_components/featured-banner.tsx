"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Percent,
  Tag,
} from "lucide-react";
import type { Product } from "@/lib/types/database";
import { cn } from "@/lib/utils";

export function FeaturedBanner() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const supabase = createClient();

      // First try to get products with highest discount
      let { data } = await supabase
        .from("products")
        .select("*")
        .in("status", ["ACTIVE", "DRAFT"])
        .not("discount_percent", "is", null)
        .gt("discount_percent", 0)
        .order("discount_percent", { ascending: false, nullsFirst: false })
        .limit(5);

      // Fallback: if no products with discount, get featured or hot products
      if (!data || data.length === 0) {
        const { data: featuredData } = await supabase
          .from("products")
          .select("*")
          .in("status", ["ACTIVE", "DRAFT"])
          .or("is_featured.eq.true,is_hot.eq.true")
          .order("created_at", { ascending: false })
          .limit(5);
        data = featuredData;
      }

      // Final fallback: just get newest products
      if (!data || data.length === 0) {
        const { data: newestData } = await supabase
          .from("products")
          .select("*")
          .in("status", ["ACTIVE", "DRAFT"])
          .order("created_at", { ascending: false })
          .limit(5);
        data = newestData;
      }

      if (data && data.length > 0) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchFeatured();
  }, []);

  useEffect(() => {
    if (products.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products.length]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  if (loading) {
    return (
      <div className="h-64 md:h-80 bg-gray-100 rounded-2xl animate-pulse" />
    );
  }

  if (products.length === 0) {
    return null;
  }

  const product = products[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-accent-pink to-brand-yellow">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* Featured Badge */}
      <div className="absolute top-4 left-4 z-20">
        <Badge className="bg-white text-brand-black text-sm font-bold px-4 py-1.5 shadow-lg">
          <Percent className="h-4 w-4 mr-1.5" />
          TOP DEALS
        </Badge>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
        {/* Product Image */}
        <div className="relative w-52 h-52 md:w-72 md:h-72 flex-shrink-0 group">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-white/30 rounded-3xl blur-2xl scale-90 group-hover:scale-100 transition-transform duration-500" />
          <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden ring-4 ring-white/30">
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 208px, 288px"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          {/* Discount Badge */}
          {product.discount_percent && product.discount_percent > 0 && (
            <div className="absolute -top-3 -right-3 bg-red-500 text-white text-lg font-bold rounded-2xl w-16 h-16 flex items-center justify-center shadow-xl ring-4 ring-white/50 animate-pulse">
              -{Math.round(product.discount_percent)}%
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 text-center md:text-left text-white">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold mb-3 line-clamp-2 drop-shadow-lg">
            {product.title}
          </h2>

          {/* Price */}
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <span className="text-3xl md:text-4xl font-bold">
              {product.currency || "$"} {product.price?.toFixed(2)}
            </span>
            {product.original_price &&
              product.original_price > (product.price || 0) && (
                <span className="text-xl text-white/60 line-through">
                  {product.currency || "$"} {product.original_price.toFixed(2)}
                </span>
              )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center md:justify-start gap-4 mb-4 text-sm text-white/80">
            {product.sales_count && product.sales_count > 0 && (
              <span>🔥 {product.sales_count.toLocaleString()} sold</span>
            )}
            {product.positive_feedback && product.positive_feedback > 0 && (
              <span>⭐ {product.positive_feedback.toFixed(1)}% positive</span>
            )}
          </div>

          {/* Coupon */}
          {product.coupon_code && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 mb-4">
              <Tag className="h-4 w-4" />
              <span className="font-medium">Coupon: {product.coupon_code}</span>
              {product.coupon_value && (
                <span className="text-brand-yellow font-bold">
                  {product.coupon_value}
                </span>
              )}
            </div>
          )}

          {/* CTA Button */}
          <a
            href={product.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button
              size="lg"
              className="bg-white text-brand-black hover:bg-white/90 font-bold text-lg px-10 py-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-2xl"
            >
              Buy Now
              <ExternalLink className="h-5 w-5 ml-2" />
            </Button>
          </a>
        </div>
      </div>

      {/* Navigation Arrows */}
      {products.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-2xl transition-all hover:scale-110 shadow-lg"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-2xl transition-all hover:scale-110 shadow-lg"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      )}

      {/* Dots */}
      {products.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-2">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 w-2 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
