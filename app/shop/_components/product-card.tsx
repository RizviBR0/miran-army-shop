"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Heart,
  ExternalLink,
  Truck,
  Star,
  TrendingUp,
  Tag,
  ThumbsUp,
} from "lucide-react";
import type { ProductWithDetails } from "@/lib/types/database";

interface ProductCardProps {
  product: ProductWithDetails;
  shipsToUser: boolean;
  hasFreeShipping: boolean;
  showSales?: boolean;
  showRating?: boolean;
}

export function ProductCard({
  product,
  shipsToUser,
  hasFreeShipping,
  showSales = false,
  showRating = false,
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200 bg-white rounded-2xl shadow-sm",
        !shipsToUser && "opacity-70"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {/* Discount Badge - only show if discount exists and is greater than 0 */}
        {product.discount_percent != null && product.discount_percent > 0 && (
          <Badge className="bg-red-500 text-white text-xs font-bold px-2 py-0.5">
            -{Math.round(product.discount_percent)}%
          </Badge>
        )}
        {product.is_hot && (
          <Badge className="bg-orange-500 text-white text-xs font-medium px-2 py-0.5">
            🔥 Hot
          </Badge>
        )}
        {hasFreeShipping && (
          <Badge className="bg-green-500 text-white text-xs font-medium px-2 py-0.5">
            <Truck className="h-3 w-3 mr-1" />
            Free
          </Badge>
        )}
      </div>

      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className={cn(
          "absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200",
          isFavorite
            ? "bg-red-500 text-white"
            : "bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white"
        )}
      >
        <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
      </button>

      {/* Image */}
      <a
        href={product.affiliate_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-transform duration-300",
              isHovered && "scale-105"
            )}
          />

          {/* Hover overlay with Buy Now button */}
          <div
            className={cn(
              "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            <span className="inline-flex items-center gap-2 bg-brand-yellow text-brand-black px-5 py-2 rounded-lg font-semibold text-sm">
              Buy Now
              <ExternalLink className="h-4 w-4" />
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title - Product Desc */}
          <h3 className="font-semibold text-text-main text-sm md:text-base line-clamp-2 mb-3 group-hover:text-brand-black transition-colors leading-tight">
            {product.title}
          </h3>

          {/* Sales Count (for Trending section) */}
          {showSales && product.sales_count && product.sales_count > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-lg">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs font-semibold">
                  {product.sales_count.toLocaleString()} sold
                </span>
              </div>
            </div>
          )}

          {/* Positive Feedback (for Best Rated section) */}
          {showRating &&
            product.positive_feedback &&
            product.positive_feedback > 0 && (
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-lg">
                  <ThumbsUp className="h-3 w-3" />
                  <span className="text-xs font-semibold">
                    {product.positive_feedback.toFixed(1)}% positive
                  </span>
                </div>
              </div>
            )}

          {/* Rating (converted from positive feedback) */}
          {product.rating && product.rating > 0 && (
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < Math.round(product.rating || 0)
                      ? "fill-brand-yellow text-brand-yellow"
                      : "fill-gray-200 text-gray-200"
                  )}
                />
              ))}
              <span className="text-xs text-text-muted ml-1">
                {product.rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 flex-wrap mb-2">
            <span className="text-xl md:text-2xl font-bold text-brand-black">
              {product.currency || "$"}
              {product.price?.toFixed(2)}
            </span>
            {product.original_price &&
              product.original_price > (product.price || 0) && (
                <span className="text-sm text-text-muted line-through">
                  {product.currency || "$"}
                  {product.original_price.toFixed(2)}
                </span>
              )}
          </div>

          {/* Coupon */}
          {product.coupon_code && (
            <div className="flex items-center gap-1.5 text-green-600 bg-green-50 border border-green-100 rounded-lg px-2.5 py-1.5 text-xs">
              <Tag className="h-3 w-3" />
              <span className="font-semibold">{product.coupon_code}</span>
              {product.coupon_value && (
                <span className="text-green-700 font-bold">
                  • {product.coupon_value}
                </span>
              )}
            </div>
          )}

          {/* Shipping warning */}
          {!shipsToUser && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1 mt-2">
              ⚠️ May not ship to your country
            </p>
          )}
        </div>
      </a>
    </Card>
  );
}
