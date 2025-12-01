import { createClient } from "@/lib/supabase/server";
import { Package } from "lucide-react";
import { ProductTable } from "./_components/product-table";
import { ProductActions } from "./_components/product-actions";

interface ProductsPageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Build query
  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  // Apply search filter
  if (params.search) {
    query = query.ilike("title", `%${params.search}%`);
  }

  // Apply status filter
  if (params.status) {
    query = query.eq("status", params.status);
  }

  const { data: products, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
  }

  // Fetch categories for the form
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Package className="h-8 w-8 text-brand-yellow" />
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-main">
            Products
          </h1>
        </div>
        <p className="text-text-muted">
          Manage your product catalog ({products?.length || 0} products)
        </p>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <ProductActions categories={categories || []} />
      </div>

      {/* Table */}
      <ProductTable products={products || []} categories={categories || []} />
    </div>
  );
}
