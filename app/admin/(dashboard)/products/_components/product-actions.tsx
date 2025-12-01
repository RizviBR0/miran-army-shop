"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import type { Category } from "@/lib/types/database";
import { ProductForm } from "./product-form";

interface ProductActionsProps {
  categories: Category[];
}

export function ProductActions({ categories }: ProductActionsProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    router.push(`/admin/products?${params.toString()}`);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <ProductForm
        categories={categories}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false);
          router.refresh();
        }}
      />
    </>
  );
}
