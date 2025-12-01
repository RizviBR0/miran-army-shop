import { ProductCard } from "./product-card";
import { shipsToCountry } from "@/lib/location";
import { createClient } from "@/lib/supabase/server";
import type { ProductWithDetails, Product } from "@/lib/types/database";

interface ProductGridProps {
  currentCountry: string;
  searchQuery?: string;
  category?: string;
  sort?: string;
  page?: number;
}

export async function ProductGrid({
  currentCountry,
  searchQuery,
  category,
  sort,
  page = 1,
}: ProductGridProps) {
  const supabase = await createClient();
  const itemsPerPage = 20;

  let products: Product[] = [];

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

        // Pagination
        const from = (page - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        query = query.range(from, to);

        const { data, error } = await query;
        if (!error && data) {
          products = data;
        }
      }
    }
  } else {
    // No category filter - get all products
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

    // Pagination
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    query = query.range(from, to);

    const { data, error } = await query;
    if (!error && data) {
      products = data;
    }
  }

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

  // Add shipping info to each product (for now, assume all ship worldwide with free shipping)
  const productsWithShipping = products.map((product: Product) => {
    // TODO: Fetch actual shipping data when shipping table is populated
    const mockShipping = [{ country_code: "ALL", is_free: true }];
    const shippingInfo = shipsToCountry(mockShipping, currentCountry);
    return {
      ...product,
      shipsToUser: shippingInfo.ships,
      hasFreeShipping: shippingInfo.isFree,
    };
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {productsWithShipping.map(
        (
          product: Product & { shipsToUser: boolean; hasFreeShipping: boolean }
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
  );
}
