import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort");

  const supabase = await createClient();

  let products: any[] = [];
  let totalCount = 0;

  try {
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

          if (search) {
            countQuery = countQuery.ilike("title", `%${search}%`);
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
          if (search) {
            query = query.ilike("title", `%${search}%`);
          }

          // Sort
          if (sort === "price_asc") {
            query = query.order("price", {
              ascending: true,
              nullsFirst: false,
            });
          } else if (sort === "price_desc") {
            query = query.order("price", {
              ascending: false,
              nullsFirst: false,
            });
          } else if (sort === "trending") {
            query = query
              .order("is_hot", { ascending: false })
              .order("created_at", { ascending: false });
          } else {
            query = query.order("created_at", { ascending: false });
          }

          // Pagination
          const from = (page - 1) * limit;
          const to = from + limit - 1;
          query = query.range(from, to);

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

      if (search) {
        countQuery = countQuery.ilike("title", `%${search}%`);
      }

      const { count } = await countQuery;
      totalCount = count || 0;

      let query = supabase
        .from("products")
        .select("*")
        .in("status", ["ACTIVE", "DRAFT"]);

      // Filter by search
      if (search) {
        query = query.ilike("title", `%${search}%`);
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
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error } = await query;
      if (!error && data) {
        products = data;
      }
    }

    const hasMore = page * limit < totalCount;

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        totalCount,
        hasMore,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
