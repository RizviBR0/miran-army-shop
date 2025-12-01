"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Grid3X3,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  product_count?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const supabase = createClient();

    // Fetch categories with product count
    const { data, error } = await supabase
      .from("categories")
      .select(
        `
        *,
        products:products(count)
      `
      )
      .order("sort_order");

    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      const categoriesWithCount =
        data?.map((cat: Record<string, unknown>) => ({
          ...cat,
          product_count: (cat.products as { count: number }[])?.[0]?.count || 0,
        })) || [];
      setCategories(categoriesWithCount as Category[]);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setEditingCategory(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || "");
    setImageUrl(category.image_url || "");
    setDialogOpen(true);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!editingCategory) {
      setSlug(generateSlug(value));
    }
  };

  const handleSave = async () => {
    if (!name || !slug) {
      alert("Name and slug are required");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const categoryData = {
      name,
      slug,
      description: description || null,
      image_url: imageUrl || null,
    };

    if (editingCategory) {
      // Update
      const { error } = await supabase
        .from("categories")
        .update(categoryData)
        .eq("id", editingCategory.id);

      if (error) {
        console.error("Error updating category:", error);
        alert("Error updating category");
      }
    } else {
      // Create - get max sort_order
      const maxOrder = Math.max(...categories.map((c) => c.sort_order), 0);

      const { error } = await supabase.from("categories").insert({
        ...categoryData,
        sort_order: maxOrder + 1,
      });

      if (error) {
        console.error("Error creating category:", error);
        alert("Error creating category");
      }
    }

    setSaving(false);
    setDialogOpen(false);
    resetForm();
    fetchCategories();
    router.refresh();
  };

  const handleDelete = async (category: Category) => {
    if (category.product_count && category.product_count > 0) {
      alert(
        `Cannot delete category "${category.name}" because it has ${category.product_count} products. Please reassign or delete the products first.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      console.error("Error deleting category:", error);
      alert("Error deleting category");
    } else {
      fetchCategories();
      router.refresh();
    }
  };

  const handleReorder = async (
    category: Category,
    direction: "up" | "down"
  ) => {
    const currentIndex = categories.findIndex((c) => c.id === category.id);
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (swapIndex < 0 || swapIndex >= categories.length) return;

    const swapCategory = categories[swapIndex];
    const supabase = createClient();

    // Swap sort_order values
    await Promise.all([
      supabase
        .from("categories")
        .update({ sort_order: swapCategory.sort_order })
        .eq("id", category.id),
      supabase
        .from("categories")
        .update({ sort_order: category.sort_order })
        .eq("id", swapCategory.id),
    ]);

    fetchCategories();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Grid3X3 className="h-8 w-8 text-brand-yellow" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-main">
              Categories
            </h1>
          </div>
          <p className="text-text-muted">
            Manage product categories ({categories.length} categories)
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreateDialog}
              className="bg-brand-yellow text-brand-black hover:bg-brand-yellow/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                {editingCategory ? "Edit Category" : "Add Category"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingCategory
                  ? "Update the category details"
                  : "Create a new product category"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Merchandise"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g., merchandise"
                />
                <p className="text-xs text-text-muted">
                  URL-friendly identifier. Auto-generated from name.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Category description..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
                {imageUrl && (
                  <div className="mt-2 relative aspect-video w-full max-w-[200px] rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-brand-yellow text-brand-black hover:bg-brand-yellow/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingCategory ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-yellow" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Grid3X3 className="h-12 w-12 mx-auto mb-4 text-text-muted opacity-50" />
              <p className="text-text-muted">No categories found</p>
              <Button
                onClick={openCreateDialog}
                variant="link"
                className="text-brand-yellow mt-2"
              >
                Create your first category
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-transparent">
                  <TableHead className="w-12">Order</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category, index) => (
                  <TableRow key={category.id} className="border-gray-200">
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          onClick={() => handleReorder(category, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          onClick={() => handleReorder(category, "down")}
                          disabled={index === categories.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-text-muted" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {category.slug}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-brand-yellow/10 text-brand-yellow">
                        {category.product_count || 0} products
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
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
                            onClick={() => openEditDialog(category)}
                            className="cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(category)}
                            className="cursor-pointer text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
