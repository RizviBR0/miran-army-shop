import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};

  // Only include fields that are provided
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.affiliate_url !== undefined)
    updateData.affiliate_url = body.affiliate_url;
  if (body.price !== undefined) updateData.price = body.price;
  if (body.original_price !== undefined)
    updateData.original_price = body.original_price;
  if (body.image_url !== undefined) updateData.image_url = body.image_url;
  if (body.category_id !== undefined) updateData.category_id = body.category_id;
  if (body.badge !== undefined) updateData.badge = body.badge;
  if (body.status !== undefined) updateData.status = body.status;

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
