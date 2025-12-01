import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  Heart,
  ChevronRight,
  Upload,
  Settings,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch stats
  const [productsResult, categoriesResult, usersResult, favoritesResult] =
    await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("favorites").select("id", { count: "exact", head: true }),
    ]);

  const stats = [
    {
      label: "Products",
      value: productsResult.count || 0,
      icon: Package,
      href: "/admin/products",
    },
    {
      label: "Categories",
      value: categoriesResult.count || 0,
      icon: FolderTree,
      href: "/admin/categories",
    },
    {
      label: "Users",
      value: usersResult.count || 0,
      icon: Users,
      href: "#",
    },
    {
      label: "Favorites",
      value: favoritesResult.count || 0,
      icon: Heart,
      href: "#",
    },
  ];

  const quickLinks = [
    {
      href: "/admin/products",
      icon: Package,
      title: "Manage Products",
      description: "View, edit, and organize your product catalog",
    },
    {
      href: "/admin/products/import",
      icon: Upload,
      title: "Import Products",
      description: "Bulk import products from Excel or CSV files",
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
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <LayoutDashboard className="h-8 w-8 text-brand-yellow" />
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-main">
            Dashboard
          </h1>
        </div>
        <p className="text-text-muted">
          Welcome back! Here&apos;s an overview of your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-bg-elevated rounded-2xl border border-border-subtle p-6 hover:shadow-lg hover:border-brand-yellow/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-xl bg-brand-yellow/10">
                <stat.icon className="h-5 w-5 text-brand-black" />
              </div>
            </div>
            <p className="text-3xl font-bold text-text-main">{stat.value}</p>
            <p className="text-sm text-text-muted mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <h2 className="font-heading text-lg font-semibold text-text-main mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickLinks.map((link) => (
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
  );
}
