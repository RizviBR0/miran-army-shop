import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Upload,
  Settings,
  LogOut,
  Home,
} from "lucide-react";

const sidebarLinks = [
  { href: "/admin", icon: LayoutDashboard, title: "Dashboard" },
  { href: "/admin/products", icon: Package, title: "Products" },
  { href: "/admin/products/import", icon: Upload, title: "Import" },
  { href: "/admin/categories", icon: FolderTree, title: "Categories" },
  { href: "/admin/settings", icon: Settings, title: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-bg-main flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-black text-white flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center">
              <span className="text-brand-black font-bold text-lg">M</span>
            </div>
            <span className="font-heading font-bold">Miran Admin</span>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <link.icon className="h-5 w-5" />
              {link.title}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Home className="h-5 w-5" />
            View Site
          </Link>
          <Link
            href="/api/admin/logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Link>
          <p className="text-xs text-white/40 px-3 pt-2">{admin.email}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
