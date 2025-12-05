import { createClient } from "@/lib/supabase/server";
import { InfiniteProductGrid } from "./infinite-product-grid";
import type { Product } from "@/lib/types/database";

interface ProductGridWrapperProps {
  currentCountry: string;
  searchQuery?: string;
  category?: string;
  sort?: string;
}

export async function ProductGridWrapper({
  currentCountry,
  searchQuery,
  category,
  sort,
}: ProductGridWrapperProps) {
  const supabase = await createClient();
  const limit = 12;

  let products: Product[] = [];
  let totalCount = 0;

  // If filtering by category, we need to join with product_categories
  if (category) {
    // First get the category ID from slug
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single();

    if (categoryData) {
      // Get product IDs for this category
      const { data: productCategories } = await supabase
        .from("product_categories")
        .select("product_id")
        .eq("category_id", categoryData.id);

      if (productCategories && productCategories.length > 0) {
        const productIds = productCategories.map((pc) => pc.product_id);

        // Get total count for pagination
        let countQuery = supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .in("id", productIds)
          .in("status", ["ACTIVE", "DRAFT"]);

        if (searchQuery) {
          countQuery = countQuery.ilike("title", `%${searchQuery}%`);
        }

        const { count } = await countQuery;
        totalCount = count || 0;

        // Build query with product IDs filter
        let query = supabase
          .from("products")
          .select("*")
          .in("id", productIds)
          .in("status", ["ACTIVE", "DRAFT"]);

        // Filter by search
        if (searchQuery) {
          query = query.ilike("title", `%${searchQuery}%`);
        }

        // Sort
        if (sort === "price_asc") {
          query = query.order("price", { ascending: true, nullsFirst: false });
        } else if (sort === "price_desc") {
          query = query.order("price", { ascending: false, nullsFirst: false });
        } else if (sort === "trending") {
          query = query
            .order("is_hot", { ascending: false })
            .order("created_at", { ascending: false });
        } else {
          query = query.order("created_at", { ascending: false });
        }

        // First page only
        query = query.range(0, limit - 1);

        const { data, error } = await query;
        if (!error && data) {
          products = data;
        }
      }
    }
  } else {
    // No category filter - get all products
    // Get total count for pagination
    let countQuery = supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .in("status", ["ACTIVE", "DRAFT"]);

    if (searchQuery) {
      countQuery = countQuery.ilike("title", `%${searchQuery}%`);
    }

    const { count } = await countQuery;
    totalCount = count || 0;

    let query = supabase
      .from("products")
      .select("*")
      .in("status", ["ACTIVE", "DRAFT"]);

    // Filter by search
    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    // Sort
    if (sort === "price_asc") {
      query = query.order("price", { ascending: true, nullsFirst: false });
    } else if (sort === "price_desc") {
      query = query.order("price", { ascending: false, nullsFirst: false });
    } else if (sort === "trending") {
      query = query
        .order("is_hot", { ascending: false })
        .order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // First page only
    query = query.range(0, limit - 1);

    const { data, error } = await query;
    if (!error && data) {
      products = data;
    }
  }

  const hasMore = totalCount > limit;

  return (
    <InfiniteProductGrid
      currentCountry={currentCountry}
      searchQuery={searchQuery}
      category={category}
      sort={sort}
      initialProducts={products}
      initialHasMore={hasMore}
      initialTotalCount={totalCount}
    />
  );
}
