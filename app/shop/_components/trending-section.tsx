import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "./product-card";
import { shipsToCountry } from "@/lib/location";
import type { Product, ProductWithDetails } from "@/lib/types/database";
import { TrendingUp } from "lucide-react";

interface TrendingSectionProps {
  currentCountry: string;
}

export async function TrendingSection({
  currentCountry,
}: TrendingSectionProps) {
  const supabase = await createClient();

  // Try to get products sorted by sales_count (Sales180Day)
  let { data: products } = await supabase
    .from("products")
    .select("*")
    .in("status", ["ACTIVE", "DRAFT"])
    .not("sales_count", "is", null)
    .gt("sales_count", 0)
    .order("sales_count", { ascending: false, nullsFirst: false })
    .limit(8);

  // Fallback: if no sales data, get hot products
  if (!products || products.length === 0) {
    const { data: hotProducts } = await supabase
      .from("products")
      .select("*")
      .in("status", ["ACTIVE", "DRAFT"])
      .eq("is_hot", true)
      .order("created_at", { ascending: false })
      .limit(8);
    products = hotProducts;
  }

  if (!products || products.length === 0) {
    return null;
  }

  // Add shipping info
  const productsWithShipping = products.map((product: Product) => {
    const mockShipping = [{ country_code: "ALL", is_free: true }];
    const shippingInfo = shipsToCountry(mockShipping, currentCountry);
    return {
      ...product,
      shipsToUser: shippingInfo.ships,
      hasFreeShipping: shippingInfo.isFree,
    };
  });

  return (
    <div className="relative">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-400/30 rounded-2xl blur-lg" />
            <div className="relative p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-main">
              Trending Now
              <span className="ml-2 inline-block animate-bounce">🔥</span>
            </h2>
            <p className="text-text-muted text-sm md:text-base">
              Best sellers in the last 180 days
            </p>
          </div>
        </div>
        <a
          href="/shop?sort=trending"
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
        >
          View All
          <TrendingUp className="h-4 w-4" />
        </a>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
              showSales
            />
          )
        )}
      </div>
    </div>
  );
}
