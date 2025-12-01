import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("miranarmy_admin_session")?.value;

    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { categoryId, externalIds } = await request.json();

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    if (
      !externalIds ||
      !Array.isArray(externalIds) ||
      externalIds.length === 0
    ) {
      return NextResponse.json(
        { error: "External IDs array is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get products that match the external IDs from the uploaded file
    const { data: matchingProducts, error: productsError } = await supabase
      .from("products")
      .select("id")
      .in("external_id", externalIds);

    if (productsError) {
      return NextResponse.json(
        { error: "Failed to fetch products: " + productsError.message },
        { status: 500 }
      );
    }

    if (!matchingProducts || matchingProducts.length === 0) {
      return NextResponse.json({
        message: "No matching products found in database",
        updated: 0,
      });
    }

    const productIds = matchingProducts.map((p) => p.id);

    // Get products that already have THIS SPECIFIC category
    // (Products can have multiple categories, so we only skip if they already have this one)
    const { data: existingLinks } = await supabase
      .from("product_categories")
      .select("product_id")
      .in("product_id", productIds)
      .eq("category_id", categoryId);

    const productsWithThisCategory = new Set(
      existingLinks?.map((l) => l.product_id) || []
    );

    // Filter products that don't already have this specific category
    const productsToUpdate = matchingProducts.filter(
      (p) => !productsWithThisCategory.has(p.id)
    );

    if (productsToUpdate.length === 0) {
      return NextResponse.json({
        message: "All matching products already have this category assigned",
        updated: 0,
        skipped: matchingProducts.length,
      });
    }

    // Insert category links for products that don't have this category yet
    const linksToInsert = productsToUpdate.map((p) => ({
      product_id: p.id,
      category_id: categoryId,
    }));

    const { error: insertError } = await supabase
      .from("product_categories")
      .insert(linksToInsert);

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to update categories: " + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Categories updated successfully",
      updated: productsToUpdate.length,
      skipped: matchingProducts.length - productsToUpdate.length,
      total: matchingProducts.length,
    });
  } catch (error) {
    console.error("Error updating categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
