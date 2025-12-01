"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export const CategoryCard = ({
  name,
  slug,
  icon,
  description,
  productCount,
  className,
}: {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  productCount?: number;
  className?: string;
}) => {
  return (
    <Link href={`/category/${slug}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative group overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated p-6 cursor-pointer transition-shadow hover:shadow-lg",
          className
        )}
      >
        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/5 to-accent-soft-pink/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative z-10">
          {/* Icon */}
          {icon && <div className="text-4xl md:text-5xl mb-4">{icon}</div>}

          {/* Name */}
          <h3 className="text-lg md:text-xl font-heading font-semibold text-text-main mb-2 group-hover:text-brand-black transition-colors">
            {name}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-sm text-text-muted line-clamp-2 mb-3">
              {description}
            </p>
          )}

          {/* Product count */}
          {productCount !== undefined && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted bg-badge-neutral-bg px-2.5 py-1 rounded-full">
              {productCount} {productCount === 1 ? "item" : "items"}
            </span>
          )}

          {/* Arrow indicator */}
          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
            <svg
              className="w-5 h-5 text-brand-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export const FeaturedProductCard = ({
  id,
  title,
  imageUrl,
  price,
  currency,
  affiliateUrl,
  isHot,
  className,
}: {
  id: string;
  title: string;
  imageUrl: string;
  price?: number;
  currency?: string;
  affiliateUrl: string;
  isHot?: boolean;
  className?: string;
}) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated transition-shadow hover:shadow-xl",
        className
      )}
    >
      {/* Hot badge */}
      {isHot && (
        <div className="absolute top-3 left-3 z-20 bg-brand-yellow text-brand-black text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <span className="text-sm">🔥</span>
          <span>HOT</span>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-text-main line-clamp-2 mb-2 group-hover:text-brand-black transition-colors">
          {title}
        </h3>
        {price && (
          <p className="text-lg font-bold text-accent-pink">
            {currency || "$"}
            {price.toFixed(2)}
          </p>
        )}
      </div>

      {/* Hover overlay with CTA */}
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 flex items-center justify-center bg-brand-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <span className="bg-brand-yellow text-brand-black px-6 py-3 rounded-xl font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform">
          View Deal
        </span>
      </a>
    </motion.div>
  );
};
