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

  // Build query - show both ACTIVE and DRAFT products
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
    query = query.order("is_hot", { ascending: false }).order("created_at", { ascending: false });
  } else {
    // Default: newest first
    query = query.order("created_at", { ascending: false });
  }

  // Pagination
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  query = query.range(from, to);

  const { data: products, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-xl font-heading font-semibold text-text-main mb-2">
          Error loading products
        </h3>
        <p className="text-text-muted">Please try again later</p>
      </div>
    );
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
      {productsWithShipping.map((product: Product & { shipsToUser: boolean; hasFreeShipping: boolean }) => (
        <ProductCard
          key={product.id}
          product={product as ProductWithDetails}
          shipsToUser={product.shipsToUser}
          hasFreeShipping={product.hasFreeShipping}
        />
      ))}
    </div>
  );
}
