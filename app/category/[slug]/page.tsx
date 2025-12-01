import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FilterBar } from "@/app/shop/_components/filter-bar";
import { ProductGrid } from "@/app/shop/_components/product-grid";
import { ProductGridSkeleton } from "@/app/shop/_components/product-grid-skeleton";
import { getCurrentCountry } from "@/lib/location";
import { createClient } from "@/lib/supabase/server";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const queryParams = await searchParams;
  const currentCountry = await getCurrentCountry();

  // Fetch category from database
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, icon, description")
    .eq("slug", slug)
    .single();

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-brand-black to-brand-black/90 text-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-5xl md:text-6xl mb-4 block">
              {category.icon}
            </span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <FilterBar
          currentCountry={currentCountry}
          searchQuery={queryParams.search}
          selectedCategory={slug}
          sortBy={queryParams.sort}
        />
      </section>

      {/* Product Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid
            currentCountry={currentCountry}
            searchQuery={queryParams.search}
            category={slug}
            sort={queryParams.sort}
            page={queryParams.page ? parseInt(queryParams.page) : 1}
          />
        </Suspense>
      </section>
    </div>
  );
}

// Dynamic route - categories fetched at request time
export const dynamic = "force-dynamic";
