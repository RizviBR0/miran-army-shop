"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  Flame,
  Star,
} from "lucide-react";
import Image from "next/image";
import type { Product, Category } from "@/lib/types/database";
import { ProductForm } from "./product-form";

interface ProductTableProps {
  products: (Product & { categories?: Category[] })[];
  categories: Category[];
}

export function ProductTable({ products, categories }: ProductTableProps) {
  const router = useRouter();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setDeletingId(id);
    try {
      const supabase = createClient();
      await supabase.from("products").delete().eq("id", id);
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const statusColors = {
    ACTIVE: "bg-green-100 text-green-700",
    DRAFT: "bg-yellow-100 text-yellow-700",
    ARCHIVED: "bg-gray-100 text-gray-700",
  };

  if (products.length === 0) {
    return (
      <div className="bg-bg-elevated rounded-2xl border border-border-subtle p-12 text-center">
        <p className="text-text-muted">No products found</p>
        <p className="text-sm text-text-muted mt-1">
          Add your first product or import from Excel
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-bg-elevated rounded-2xl border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-main border-b border-border-subtle">
            <tr>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                Product
              </th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                Price
              </th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                Status
              </th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                Flags
              </th>
              <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-bg-main/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-bg-main flex-shrink-0">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                          ?
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-text-main truncate max-w-xs">
                        {product.title}
                      </p>
                      {product.store_name && (
                        <p className="text-sm text-text-muted truncate">
                          {product.store_name}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {product.price ? (
                    <span className="font-medium">
                      ${product.price.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-text-muted">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Badge
                    className={
                      statusColors[product.status] || statusColors.DRAFT
                    }
                  >
                    {product.status}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {product.is_hot && (
                      <Flame className="h-4 w-4 text-orange-500" />
                    )}
                    {product.is_featured && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                    {!product.is_hot && !product.is_featured && (
                      <span className="text-text-muted">-</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-white border-gray-200"
                    >
                      <DropdownMenuItem
                        onClick={() => setEditingProduct(product)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a
                          href={product.affiliate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Link
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600"
                        disabled={deletingId === product.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deletingId === product.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingProduct && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            setEditingProduct(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
