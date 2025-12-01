import { Suspense } from "react";
import { ShopHeader } from "./_components/shop-header";
import { FeaturedBanner } from "./_components/featured-banner";
import { FilterBar } from "./_components/filter-bar";
import { ProductGrid } from "./_components/product-grid";
import { TrendingSection } from "./_components/trending-section";
import { BestRatedSection } from "./_components/best-rated-section";
import { ProductGridSkeleton } from "./_components/product-grid-skeleton";
import { getCurrentCountry } from "@/lib/location";
import { Package, Sparkles } from "lucide-react";

interface ShopPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const currentCountry = await getCurrentCountry();
  const isFiltering = params.search || params.category || params.sort;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Shop Header */}
      <ShopHeader />

      {/* Sticky Search/Filter Bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <FilterBar
            currentCountry={currentCountry}
            searchQuery={params.search}
            selectedCategory={params.category}
            sortBy={params.sort}
          />
        </section>
      </div>

      {/* Featured Banner - Products with highest discount */}
      {!isFiltering && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Suspense
            fallback={
              <div className="h-72 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl animate-pulse" />
            }
          >
            <FeaturedBanner />
          </Suspense>
        </section>
      )}

      {/* Trending Section - Highest sales */}
      {!isFiltering && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<ProductGridSkeleton count={4} />}>
            <TrendingSection currentCountry={currentCountry} />
          </Suspense>
        </section>
      )}

      {/* Section Divider */}
      {!isFiltering && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <Sparkles className="h-5 w-5 text-brand-yellow" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          </div>
        </div>
      )}

      {/* Best Rated Section - Highest positive feedback */}
      {!isFiltering && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<ProductGridSkeleton count={4} />}>
            <BestRatedSection currentCountry={currentCountry} />
          </Suspense>
        </section>
      )}

      {/* All Products Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-yellow/30 rounded-2xl blur-lg" />
              <div className="relative p-3 bg-gradient-to-br from-brand-yellow to-yellow-500 rounded-2xl shadow-lg">
                <Package className="h-6 w-6 text-brand-black" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-main">
                {isFiltering ? "Search Results" : "All Products"}
                <span className="ml-2 inline-block">🛍️</span>
              </h2>
              <p className="text-text-muted text-sm md:text-base">
                {isFiltering
                  ? "Showing filtered results"
                  : "Browse our entire collection"}
              </p>
            </div>
          </div>
        </div>

        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid
            currentCountry={currentCountry}
            searchQuery={params.search}
            category={params.category}
            sort={params.sort}
            page={params.page ? parseInt(params.page) : 1}
          />
        </Suspense>
      </section>

      {/* Footer spacing with gradient fade */}
      <div className="h-16 bg-gradient-to-b from-gray-50 to-white" />
    </div>
  );
}
