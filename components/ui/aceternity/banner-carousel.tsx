"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export const BannerCarousel = ({
  items,
  className,
  autoplayInterval = 5000,
}: {
  items: {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl: string;
    href: string;
    cta?: string;
  }[];
  className?: string;
  autoplayInterval?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(goToNext, autoplayInterval);
    return () => clearInterval(interval);
  }, [goToNext, autoplayInterval, items.length]);

  if (items.length === 0) return null;

  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-2xl", className)}
    >
      <div className="relative aspect-[21/9] md:aspect-[3/1] w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div className="relative h-full w-full">
              <Image
                src={items[currentIndex].imageUrl}
                alt={items[currentIndex].title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-black/70 via-brand-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-xl px-6 md:px-12">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl md:text-4xl font-heading font-bold text-white mb-2 md:mb-4"
                  >
                    {items[currentIndex].title}
                  </motion.h2>
                  {items[currentIndex].subtitle && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-sm md:text-lg text-white/80 mb-4 md:mb-6"
                    >
                      {items[currentIndex].subtitle}
                    </motion.p>
                  )}
                  <motion.a
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    href={items[currentIndex].href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-brand-yellow text-brand-black px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-semibold hover:bg-brand-yellow/90 transition-all hover:scale-105 shadow-lg text-sm md:text-base"
                  >
                    {items[currentIndex].cta || "View Deal"}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/20 hover:bg-white/40 transition-all backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <svg
              className="w-4 h-4 md:w-6 md:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/20 hover:bg-white/40 transition-all backdrop-blur-sm"
            aria-label="Next slide"
          >
            <svg
              className="w-4 h-4 md:w-6 md:h-6 text-white"
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
          </button>
        </>
      )}

      {/* Dots indicator */}
      {items.length > 1 && (
        <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "h-1.5 md:h-2 rounded-full transition-all",
                idx === currentIndex
                  ? "bg-brand-yellow w-6 md:w-8"
                  : "bg-white/50 w-1.5 md:w-2 hover:bg-white/80"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
