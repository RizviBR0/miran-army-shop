"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ProductCard } from "./product-card";
import { ProductGridSkeleton } from "./product-grid-skeleton";
import { Loader2 } from "lucide-react";
import type { ProductWithDetails, Product } from "@/lib/types/database";

interface InfiniteProductGridProps {
  currentCountry: string;
  searchQuery?: string;
  category?: string;
  sort?: string;
  initialProducts: Product[];
  initialHasMore: boolean;
  initialTotalCount: number;
}

export function InfiniteProductGrid({
  currentCountry,
  searchQuery,
  category,
  sort,
  initialProducts,
  initialHasMore,
  initialTotalCount,
}: InfiniteProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset when filters change
  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    setHasMore(initialHasMore);
    setTotalCount(initialTotalCount);
  }, [
    initialProducts,
    initialHasMore,
    initialTotalCount,
    searchQuery,
    category,
    sort,
  ]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;

    try {
      const params = new URLSearchParams({
        page: nextPage.toString(),
        limit: "12",
      });

      if (category) params.set("category", category);
      if (searchQuery) params.set("search", searchQuery);
      if (sort) params.set("sort", sort);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();

      if (data.products && data.products.length > 0) {
        setProducts((prev) => [...prev, ...data.products]);
        setPage(nextPage);
        setHasMore(data.pagination.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, category, searchQuery, sort]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, isLoading, loadMore]);

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-heading font-semibold text-text-main mb-2">
          No products found
        </h3>
        <p className="text-text-muted">Try adjusting your search or filters</p>
      </div>
    );
  }

  // Add shipping info to each product
  const productsWithShipping = products.map((product: Product) => {
    // Assume all ship worldwide with free shipping for now
    return {
      ...product,
      shipsToUser: true,
      hasFreeShipping: true,
    };
  });

  return (
    <div className="space-y-8">
      {/* Product count */}
      <p className="text-sm text-text-muted">
        Showing {products.length} of {totalCount} products
      </p>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {productsWithShipping.map(
          (
            product: Product & {
              shipsToUser: boolean;
              hasFreeShipping: boolean;
            }
          ) => (
            <ProductCard
              key={product.id}
              product={product as ProductWithDetails}
              shipsToUser={product.shipsToUser}
              hasFreeShipping={product.hasFreeShipping}
            />
          )
        )}
      </div>

      {/* Loading indicator */}
      <div ref={loaderRef} className="py-8">
        {isLoading && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-brand-yellow" />
              <span className="text-text-muted">Loading more products...</span>
            </div>
            <ProductGridSkeleton count={4} />
          </div>
        )}

        {!hasMore && products.length > 0 && (
          <div className="text-center py-8">
            <p className="text-text-muted">
              You&apos;ve seen all {totalCount} products! 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
