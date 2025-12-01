"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SUPPORTED_COUNTRIES, type Country } from "@/lib/types/database";
import { Menu, X, Heart, ChevronDown, Globe } from "lucide-react";

interface NavbarProps {
  currentCountry?: string;
}

export function Navbar({ currentCountry = "US" }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const country =
    SUPPORTED_COUNTRIES.find((c) => c.code === currentCountry) ||
    SUPPORTED_COUNTRIES[1];

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/favorites", label: "Favorites", icon: Heart },
  ];

  const handleCountryChange = async (countryCode: string) => {
    // Set cookie via server action or client-side
    document.cookie = `miranarmy_country=${countryCode}; path=/; max-age=${
      60 * 60 * 24 * 365
    }; samesite=lax`;
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border-subtle bg-bg-elevated/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo/logo_circle.png"
              alt="Miran Army"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="hidden sm:block font-heading font-bold text-lg text-text-main">
              Miran Army
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  pathname === link.href
                    ? "bg-brand-yellow text-brand-black"
                    : "text-text-main hover:bg-badge-neutral-bg"
                )}
              >
                <span className="flex items-center gap-1.5">
                  {link.icon && <link.icon className="h-4 w-4" />}
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Right side: Country selector */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{country.flag}</span>
                  <span className="hidden lg:inline text-sm">
                    {country.name}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 max-h-80 overflow-y-auto"
              >
                {SUPPORTED_COUNTRIES.map((c) => (
                  <DropdownMenuItem
                    key={c.code}
                    onClick={() => handleCountryChange(c.code)}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer",
                      c.code === country.code && "bg-brand-yellow/10"
                    )}
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border-subtle">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    pathname === link.href
                      ? "bg-brand-yellow text-brand-black"
                      : "text-text-main hover:bg-badge-neutral-bg"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {link.icon && <link.icon className="h-4 w-4" />}
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
