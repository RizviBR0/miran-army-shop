import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify admin credentials against our custom users table
    const { data: isValid, error: rpcError } = await supabase.rpc(
      "verify_admin_password",
      {
        admin_email: email,
        admin_password: password,
      }
    );

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      return NextResponse.json(
        { error: "Login failed. Please try again." },
        { status: 500 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Get admin user data
    const { data: adminUser } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("email", email)
      .eq("role", "ADMIN")
      .single();

    if (!adminUser) {
      return NextResponse.json(
        { error: "Admin account not found" },
        { status: 401 }
      );
    }

    // Create response with admin session cookie
    const response = NextResponse.json({ success: true });

    // Set secure admin session cookie (24 hours)
    // In production, use a proper JWT or signed token
    const sessionData = Buffer.from(
      JSON.stringify({
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      })
    ).toString("base64");

    response.cookies.set("miranarmy_admin_session", sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
