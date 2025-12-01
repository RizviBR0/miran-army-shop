import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Upload,
  Settings,
  ChevronRight,
  LogOut,
} from "lucide-react";

// Helper to verify admin session
async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("miranarmy_admin_session");

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const sessionData = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString()
    );

    // Check if session is expired
    if (sessionData.exp < Date.now()) {
      return null;
    }

    // Check if role is ADMIN
    if (sessionData.role !== "ADMIN") {
      return null;
    }

    return sessionData;
  } catch {
    return null;
  }
}

export default async function AdminPage() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  const adminLinks = [
    {
      href: "/admin/products",
      icon: Package,
      title: "Products",
      description: "Manage all products, edit details, and update status",
    },
    {
      href: "/admin/products/import",
      icon: Upload,
      title: "Import Products",
      description: "Bulk import products from Excel files",
    },
    {
      href: "/admin/categories",
      icon: FolderTree,
      title: "Categories",
      description: "Manage product categories and organization",
    },
    {
      href: "/admin/settings",
      icon: Settings,
      title: "Settings",
      description: "Configure site settings and preferences",
    },
  ];

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <LayoutDashboard className="h-8 w-8 text-brand-yellow" />
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-main">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-text-muted">Logged in as {admin.email}</p>
          </div>
          <Link
            href="/api/admin/logout"
            className="flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:text-red-500 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Products", value: "0", change: "+0 this week" },
            { label: "Categories", value: "6", change: "Active" },
            { label: "Favorites", value: "0", change: "Total saves" },
            { label: "Users", value: "1", change: "Registered" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-bg-elevated rounded-2xl border border-border-subtle p-4 md:p-6"
            >
              <p className="text-sm text-text-muted">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-bold text-text-main mt-1">
                {stat.value}
              </p>
              <p className="text-xs text-text-muted mt-1">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Admin Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group bg-bg-elevated rounded-2xl border border-border-subtle p-6 hover:shadow-lg transition-all hover:border-brand-yellow/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-brand-yellow/10 text-brand-black">
                    <link.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-text-main group-hover:text-brand-black transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm text-text-muted mt-1">
                      {link.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-brand-black group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
