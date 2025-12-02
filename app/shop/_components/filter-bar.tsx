"use client";

import { useCallback, useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_COUNTRIES } from "@/lib/types/database";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Filter,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  product_count?: number;
}

interface FilterBarProps {
  currentCountry: string;
  searchQuery?: string;
  selectedCategory?: string;
  sortBy?: string;
}

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "trending", label: "Trending" },
  { value: "rating", label: "Best Rated" },
];

const categoryEmojis: Record<string, string> = {
  all: "🛍️",
  clothing: "👕",
  accessories: "💍",
  electronics: "📱",
  home: "🏠",
  beauty: "💄",
  toys: "🧸",
  sports: "⚽",
  default: "📦",
};

export function FilterBar({
  currentCountry,
  searchQuery = "",
  selectedCategory = "all",
  sortBy = "newest",
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", name: "All Categories", slug: "all" },
  ]);

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery ||
    (selectedCategory && selectedCategory !== "all") ||
    (sortBy && sortBy !== "newest");

  // Detect scroll to minimize the filter bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch categories from database (only those with products)
  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();

      // Get categories with their product count
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("sort_order");

      if (categoriesData) {
        // Get product counts for each category
        const { data: productCounts } = await supabase
          .from("product_categories")
          .select("category_id");

        // Count products per category
        const countMap = new Map<string, number>();
        productCounts?.forEach((pc) => {
          countMap.set(pc.category_id, (countMap.get(pc.category_id) || 0) + 1);
        });

        // Filter categories that have at least one product
        const categoriesWithProducts = categoriesData
          .filter((cat) => (countMap.get(cat.id) || 0) > 0)
          .map((cat) => ({
            ...cat,
            product_count: countMap.get(cat.id) || 0,
          }));

        setCategories([
          { id: "all", name: "All Categories", slug: "all" },
          ...categoriesWithProducts,
        ]);
      }
    };
    fetchCategories();
  }, []);

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      });

      return newSearchParams.toString();
    },
    [searchParams]
  );

  const updateFilters = useCallback(
    (params: Record<string, string | null>) => {
      startTransition(() => {
        const queryString = createQueryString(params);
        router.push(`/shop${queryString ? `?${queryString}` : ""}`);
      });
    },
    [createQueryString, router]
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      updateFilters({ search: search || null });
    },
    [search, updateFilters]
  );

  const handleReset = useCallback(() => {
    setSearch("");
    startTransition(() => {
      router.push("/shop");
    });
  }, [router]);

  const handleCountryChange = (country: string) => {
    // Set cookie and reload
    document.cookie = `miranarmy_country=${country}; path=/; max-age=${
      60 * 60 * 24 * 365
    }; samesite=lax`;
    window.location.reload();
  };

  const getCategoryEmoji = (slug: string) => {
    return categoryEmojis[slug] || categoryEmojis.default;
  };

  const showCompact = isScrolled && !isExpanded && !isFocused;

  return (
    <div className="relative">
      {/* Container */}
      <div
        className={cn(
          "relative bg-white rounded-xl border border-gray-200 transition-all duration-300",
          showCompact ? "p-2" : "p-4"
        )}
      >
        <div
          className={cn(
            "relative flex flex-col transition-all duration-300",
            showCompact ? "gap-0" : "gap-3"
          )}
        >
          {/* Search Bar - Always visible */}
          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex items-center">
              <Search
                className={cn(
                  "absolute left-3 h-4 w-4 transition-colors duration-200",
                  isFocused ? "text-brand-yellow" : "text-text-muted"
                )}
              />
              <Input
                type="search"
                placeholder="Search for amazing deals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={cn(
                  "pl-10 text-sm bg-white border border-gray-200 rounded-lg focus:border-brand-yellow transition-all",
                  showCompact ? "pr-28 py-2" : "pr-36 py-3"
                )}
              />
              <div className="absolute right-1.5 flex items-center gap-1.5">
                {/* Reset Button */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                    title="Reset filters"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
                {/* Search Button */}
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-brand-yellow text-brand-black font-medium text-sm rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Search
                </button>
                {/* Expand/Collapse Button - Only when scrolled */}
                {isScrolled && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors ml-1"
                    title={isExpanded ? "Collapse filters" : "Expand filters"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Collapsible Section - Filter Controls & Category Pills */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              showCompact ? "max-h-0 opacity-0" : "max-h-96 opacity-100"
            )}
          >
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              {/* Category */}
              <div className="flex-1">
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => updateFilters({ category: value })}
                >
                  <SelectTrigger className="h-10 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.slug}
                        className="rounded"
                      >
                        <span className="flex items-center gap-2">
                          <span>{getCategoryEmoji(cat.slug)}</span>
                          <span>{cat.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="flex-1">
                <Select
                  value={currentCountry}
                  onValueChange={handleCountryChange}
                >
                  <SelectTrigger className="h-10 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Location" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {SUPPORTED_COUNTRIES.map((country) => (
                      <SelectItem
                        key={country.code}
                        value={country.code}
                        className="rounded"
                      >
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="flex-1">
                <Select
                  value={sortBy}
                  onValueChange={(value) => updateFilters({ sort: value })}
                >
                  <SelectTrigger className="h-10 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {sortOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="rounded"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilters({ category: cat.slug })}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5",
                    selectedCategory === cat.slug
                      ? "bg-brand-yellow text-brand-black"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <span>{getCategoryEmoji(cat.slug)}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading overlay */}
        {isPending && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-xl z-10">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow border border-gray-200">
              <div className="w-4 h-4 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">Searching...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
