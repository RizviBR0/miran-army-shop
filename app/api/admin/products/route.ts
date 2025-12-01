import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .insert({
      title: body.title,
      description: body.description,
      affiliate_url: body.affiliate_url,
      price: body.price,
      original_price: body.original_price || null,
      image_url: body.image_url,
      category_id: body.category_id,
      badge: body.badge || null,
      status: body.status || "DRAFT",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
