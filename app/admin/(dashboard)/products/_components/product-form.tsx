"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, X } from "lucide-react";
import type { Product, Category, ProductStatus } from "@/lib/types/database";

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductForm({
  product,
  categories,
  isOpen,
  onClose,
  onSuccess,
}: ProductFormProps) {
  const isEditing = !!product;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentCategoryId, setCurrentCategoryId] = useState<string>("");

  const [formData, setFormData] = useState({
    title: product?.title || "",
    short_desc: product?.short_desc || "",
    image_url: product?.image_url || "",
    ali_url: product?.ali_url || "",
    affiliate_url: product?.affiliate_url || "",
    price: product?.price?.toString() || "",
    currency: product?.currency || "USD",
    rating: product?.rating?.toString() || "",
    store_name: product?.store_name || "",
    is_hot: product?.is_hot || false,
    is_featured: product?.is_featured || false,
    status: product?.status || "ACTIVE",
    category_id: "",
  });

  // Fetch current category when editing
  useEffect(() => {
    if (isEditing && product) {
      const fetchCurrentCategory = async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from("product_categories")
          .select("category_id")
          .eq("product_id", product.id)
          .single();

        if (data) {
          setCurrentCategoryId(data.category_id);
          setFormData((prev) => ({ ...prev, category_id: data.category_id }));
        }
      };
      fetchCurrentCategory();
    }
  }, [isEditing, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const productData = {
        title: formData.title,
        short_desc: formData.short_desc || null,
        image_url: formData.image_url,
        ali_url: formData.ali_url,
        affiliate_url: formData.affiliate_url,
        price: formData.price ? parseFloat(formData.price) : null,
        currency: formData.currency,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        store_name: formData.store_name || null,
        is_hot: formData.is_hot,
        is_featured: formData.is_featured,
        status: formData.status as "ACTIVE" | "DRAFT" | "ARCHIVED",
      };

      if (isEditing && product) {
        const { error: updateError } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (updateError) throw updateError;

        // Update category if changed
        if (
          formData.category_id &&
          formData.category_id !== currentCategoryId
        ) {
          // Remove old category link
          await supabase
            .from("product_categories")
            .delete()
            .eq("product_id", product.id);

          // Add new category link
          await supabase.from("product_categories").insert({
            product_id: product.id,
            category_id: formData.category_id,
          });
        } else if (formData.category_id && !currentCategoryId) {
          // Add category if none existed
          await supabase.from("product_categories").insert({
            product_id: product.id,
            category_id: formData.category_id,
          });
        }
      } else {
        const { data: newProduct, error: insertError } = await supabase
          .from("products")
          .insert(productData)
          .select()
          .single();

        if (insertError) throw insertError;

        // Add category if selected
        if (formData.category_id && newProduct) {
          await supabase.from("product_categories").insert({
            product_id: newProduct.id,
            category_id: formData.category_id,
          });
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to save product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                placeholder="Cute Plush Toy..."
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="short_desc">Short Description</Label>
              <Input
                id="short_desc"
                value={formData.short_desc}
                onChange={(e) =>
                  setFormData({ ...formData, short_desc: e.target.value })
                }
                placeholder="A brief description..."
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="image_url">Image URL *</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                required
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ali_url">AliExpress URL *</Label>
              <Input
                id="ali_url"
                type="url"
                value={formData.ali_url}
                onChange={(e) =>
                  setFormData({ ...formData, ali_url: e.target.value })
                }
                required
                placeholder="https://aliexpress.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="affiliate_url">Affiliate URL *</Label>
              <Input
                id="affiliate_url"
                type="url"
                value={formData.affiliate_url}
                onChange={(e) =>
                  setFormData({ ...formData, affiliate_url: e.target.value })
                }
                required
                placeholder="https://s.click.aliexpress.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="9.99"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({ ...formData, rating: e.target.value })
                }
                placeholder="4.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store_name">Store Name</Label>
              <Input
                id="store_name"
                value={formData.store_name}
                onChange={(e) =>
                  setFormData({ ...formData, store_name: e.target.value })
                }
                placeholder="Official Store"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ProductStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_hot}
                onChange={(e) =>
                  setFormData({ ...formData, is_hot: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm">🔥 Hot Product</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData({ ...formData, is_featured: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm">⭐ Featured</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
