import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "./product-card";
import { shipsToCountry } from "@/lib/location";
import type { Product, ProductWithDetails } from "@/lib/types/database";
import { ThumbsUp } from "lucide-react";

interface BestRatedSectionProps {
  currentCountry: string;
}

export async function BestRatedSection({
  currentCountry,
}: BestRatedSectionProps) {
  const supabase = await createClient();

  // Try to get products sorted by positive_feedback
  let { data: products } = await supabase
    .from("products")
    .select("*")
    .in("status", ["ACTIVE", "DRAFT"])
    .not("positive_feedback", "is", null)
    .gt("positive_feedback", 0)
    .order("positive_feedback", { ascending: false, nullsFirst: false })
    .limit(8);

  // Fallback: if no feedback data, get products sorted by rating
  if (!products || products.length === 0) {
    const { data: ratedProducts } = await supabase
      .from("products")
      .select("*")
      .in("status", ["ACTIVE", "DRAFT"])
      .not("rating", "is", null)
      .order("rating", { ascending: false, nullsFirst: false })
      .limit(8);
    products = ratedProducts;
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
            <div className="absolute inset-0 bg-green-400/30 rounded-2xl blur-lg" />
            <div className="relative p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg">
              <ThumbsUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-main">
              Best Rated
              <span className="ml-2 inline-block">⭐</span>
            </h2>
            <p className="text-text-muted text-sm md:text-base">
              Highest positive feedback from buyers
            </p>
          </div>
        </div>
        <a
          href="/shop?sort=rating"
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-green-500 hover:text-green-600 transition-colors"
        >
          View All
          <ThumbsUp className="h-4 w-4" />
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
              showRating
            />
          )
        )}
      </div>
    </div>
  );
}
