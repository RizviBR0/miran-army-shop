"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Info,
  X,
  Copy,
} from "lucide-react";
import * as XLSX from "xlsx";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Excel field names from AliExpress export
interface AliExpressExcelRow {
  ProductId: string;
  "Image Url": string;
  "Video Url"?: string;
  "Product Desc": string;
  "Origin Price": string; // e.g., "MXN 91.60"
  "Discount Price": string; // e.g., "MXN 83.90"
  Discount: string; // e.g., "8%"
  Currency: string; // e.g., "MXN"
  "Direct linking commission rate (%)": number;
  "Estimated direct linking commission": string;
  "Indirect linking commission rate (%)": number;
  "Estimated indirect linking commission": string;
  Sales180Day: number;
  "Positive Feedback": string; // e.g., "94.30%"
  "Promotion Url": string;
  "Code Name"?: string;
  "Code Start Time"?: string;
  "Code End Time"?: string;
  "Code Value"?: string;
  "Code Quantity"?: number;
  "Code Minimum Spend"?: string;
}

interface ImportProduct {
  // Mapped fields
  external_id: string;
  title: string;
  short_desc: string;
  image_url: string;
  video_url?: string;
  ali_url: string;
  affiliate_url: string;
  price: number;
  original_price: number;
  currency: string;
  discount_percent: number;
  commission_rate: number;
  sales_count: number;
  rating: number;
  // Coupon info
  coupon_code?: string;
  coupon_value?: string;
  coupon_min_spend?: string;
  coupon_end_date?: string;
  // Meta
  category_id: string;
  status: string;
  isValid: boolean;
  isDuplicate?: boolean;
  errors: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Helper to parse price strings like "MXN 91.60" or "91.60"
function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  // Remove currency code and any non-numeric characters except decimal point
  const cleanedPrice = priceStr.replace(/[^0-9.]/g, "");
  return parseFloat(cleanedPrice) || 0;
}

// Helper to parse percentage strings like "94.30%" or "8%"
function parsePercentage(percentStr: string): number {
  if (!percentStr) return 0;
  const cleaned = percentStr.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}

export default function ImportProductsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [products, setProducts] = useState<ImportProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    skipped: number;
  } | null>(null);

  // Progress tracking
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [currentProductName, setCurrentProductName] = useState("");
  const cancelRef = useRef(false);

  // Duplicate tracking
  const [duplicateCount, setDuplicateCount] = useState(0);

  // Update existing products category
  const [updatingCategory, setUpdatingCategory] = useState(false);
  const [updateResult, setUpdateResult] = useState<{
    updated: number;
    skipped: number;
  } | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("sort_order");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportResult(null);
    setDuplicateCount(0);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<AliExpressExcelRow>(worksheet);

      // Check for existing products in database
      const supabase = createClient();
      const productIds = jsonData
        .map((row) => String(row.ProductId || ""))
        .filter((id) => id);

      // Fetch existing products
      const { data: existingProducts } = await supabase
        .from("products")
        .select("external_id")
        .in("external_id", productIds);

      const existingIds = new Set(
        existingProducts?.map((p) => p.external_id) || []
      );
      let dupes = 0;

      const parsedProducts: ImportProduct[] = jsonData.map((row) => {
        const errors: string[] = [];
        const externalId = String(row.ProductId || "");

        // Check if duplicate
        const isDuplicate = existingIds.has(externalId);
        if (isDuplicate) {
          dupes++;
          errors.push("Product already exists in database");
        }

        // Validate required fields
        if (!row.ProductId) errors.push("ProductId is required");
        if (!row["Image Url"]) errors.push("Image URL is required");
        if (!row["Product Desc"])
          errors.push("Product description is required");
        if (!row["Promotion Url"]) errors.push("Promotion URL is required");
        if (!row["Discount Price"]) errors.push("Discount price is required");

        // Parse prices
        const discountPrice = parsePrice(row["Discount Price"]);
        const originalPrice = parsePrice(row["Origin Price"]);
        const discountPercent = parsePercentage(row.Discount);
        const commissionRate = row["Direct linking commission rate (%)"] || 0;
        const rating = parsePercentage(row["Positive Feedback"]);
        const salesCount = row.Sales180Day || 0;

        return {
          external_id: externalId,
          title: String(row["Product Desc"] || "").substring(0, 200), // Truncate for title
          short_desc: String(row["Product Desc"] || ""),
          image_url: String(row["Image Url"] || ""),
          video_url: row["Video Url"] || undefined,
          ali_url: String(row["Promotion Url"] || "").split("?")[0], // Base URL without tracking
          affiliate_url: String(row["Promotion Url"] || ""),
          price: discountPrice,
          original_price: originalPrice,
          currency: row.Currency || "USD",
          discount_percent: discountPercent,
          commission_rate: commissionRate,
          sales_count: salesCount,
          rating: rating / 20, // Convert percentage to 5-star rating
          // Coupon info
          coupon_code: row["Code Name"] || undefined,
          coupon_value: row["Code Value"] || undefined,
          coupon_min_spend: row["Code Minimum Spend"] || undefined,
          coupon_end_date: row["Code End Time"] || undefined,
          // Meta
          category_id: selectedCategoryId,
          status: "DRAFT",
          isValid: errors.length === 0 || (errors.length === 1 && isDuplicate),
          isDuplicate,
          errors,
        };
      });

      setDuplicateCount(dupes);
      setProducts(parsedProducts);
    } catch (error) {
      console.error("Error parsing file:", error);
      alert(
        "Error parsing file. Please make sure it's a valid Excel file exported from AliExpress."
      );
    }
  };

  // Update category for all products when selection changes
  useEffect(() => {
    if (selectedCategoryId && products.length > 0) {
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          category_id: selectedCategoryId,
        }))
      );
    }
  }, [selectedCategoryId]);

  const removeProduct = (index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadTemplate = () => {
    const template = [
      {
        ProductId: "1005008075278941",
        "Image Url": "https://ae-pic-a1.aliexpress-media.com/kf/example.jpg",
        "Video Url": "",
        "Product Desc": "Your Product Title Here",
        "Origin Price": "MXN 91.60",
        "Discount Price": "MXN 83.90",
        Discount: "8%",
        Currency: "MXN",
        "Direct linking commission rate (%)": 7,
        "Estimated direct linking commission": "MXN 5.87",
        "Indirect linking commission rate (%)": 7,
        "Estimated indirect linking commission": "MXN 5.87",
        Sales180Day: 2223,
        "Positive Feedback": "94.30%",
        "Promotion Url": "https://s.click.aliexpress.com/e/_example",
        "Code Name": "",
        "Code Start Time": "",
        "Code End Time": "",
        "Code Value": "",
        "Code Quantity": "",
        "Code Minimum Spend": "",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "aliexpress-import-template.xlsx");
  };

  const handleImport = async () => {
    // Category selection is optional for now (until migration is applied)
    // if (!selectedCategoryId) {
    //   alert("Please select a category for the products");
    //   return;
    // }

    // Filter out duplicates and invalid products
    const validProducts = products.filter((p) => p.isValid && !p.isDuplicate);
    if (validProducts.length === 0) {
      alert("No new valid products to import (duplicates are skipped)");
      return;
    }

    setImporting(true);
    setImportResult(null);
    cancelRef.current = false;
    setProgress({ current: 0, total: validProducts.length });

    const supabase = createClient();
    let success = 0;
    let failed = 0;
    let skipped = duplicateCount;

    for (let i = 0; i < validProducts.length; i++) {
      // Check for cancellation
      if (cancelRef.current) {
        break;
      }

      const product = validProducts[i];
      setCurrentProductName(product.title.substring(0, 40) + "...");
      setProgress({ current: i + 1, total: validProducts.length });

      // Double-check if product already exists (in case of concurrent imports)
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("external_id", product.external_id)
        .single();

      if (existing) {
        // Skip duplicate
        skipped++;
        continue;
      }

      // Insert new product
      const { data: insertedProduct, error } = await supabase
        .from("products")
        .insert({
          external_id: product.external_id,
          title: product.title,
          short_desc: product.short_desc,
          image_url: product.image_url,
          ali_url: product.affiliate_url,
          affiliate_url: product.affiliate_url,
          price: product.price,
          original_price: product.original_price,
          currency: product.currency,
          discount_percent: product.discount_percent,
          sales_count: product.sales_count,
          positive_feedback: product.rating * 20, // Convert 5-star back to percentage
          rating: product.rating,
          video_url: product.video_url || null,
          store_name: null,
          is_hot: product.sales_count > 1000,
          is_featured: product.discount_percent >= 20, // Feature products with 20%+ discount
          status: "DRAFT",
          coupon_code: product.coupon_code || null,
          coupon_value: product.coupon_value || null,
          coupon_min_spend: product.coupon_min_spend || null,
          coupon_end_date: product.coupon_end_date || null,
        })
        .select("id")
        .single();

      if (error || !insertedProduct) {
        console.error("Error inserting product:", error);
        failed++;
      } else {
        // Link product to category in junction table
        if (selectedCategoryId) {
          const { error: linkError } = await supabase
            .from("product_categories")
            .insert({
              product_id: insertedProduct.id,
              category_id: selectedCategoryId,
            });

          if (linkError) {
            console.error("Error linking product to category:", linkError);
            // Product was inserted but category link failed - still count as success
          }
        }
        success++;
      }
    }

    setImportResult({ success, failed, skipped });
    setImporting(false);
    setCurrentProductName("");

    if (success > 0 && !cancelRef.current) {
      setProducts([]);
      setFile(null);
    }
  };

  const handleCancel = () => {
    cancelRef.current = true;
  };

  // Function to add category to products in the uploaded Excel file
  // Products can have multiple categories - this adds the selected category if not already assigned
  const handleUpdateExistingCategory = async () => {
    if (!selectedCategoryId) {
      alert("Please select a category first");
      return;
    }

    if (products.length === 0) {
      alert("Please upload an Excel file first");
      return;
    }

    // Get external IDs from the uploaded Excel file
    const externalIds = products.map((p) => p.external_id).filter((id) => id);

    if (externalIds.length === 0) {
      alert("No valid product IDs found in the uploaded file");
      return;
    }

    const categoryName =
      categories.find((c) => c.id === selectedCategoryId)?.name ||
      "selected category";

    if (
      !confirm(
        `This will add "${categoryName}" to ${externalIds.length} products from the uploaded file.\n\nProducts can have multiple categories - this won't remove existing categories.\n\nContinue?`
      )
    ) {
      return;
    }

    setUpdatingCategory(true);
    setUpdateResult(null);

    try {
      const response = await fetch("/api/admin/update-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId: selectedCategoryId,
          externalIds: externalIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error updating categories");
      } else {
        setUpdateResult({ updated: data.updated, skipped: data.skipped || 0 });
        if (data.updated === 0) {
          alert(
            data.message ||
              "No products were updated. They may already have this category or don't exist in the database."
          );
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while updating categories");
    } finally {
      setUpdatingCategory(false);
    }
  };

  const validCount = products.filter((p) => p.isValid && !p.isDuplicate).length;
  const invalidCount = products.filter(
    (p) => !p.isValid && !p.isDuplicate
  ).length;
  const duplicatesInList = products.filter((p) => p.isDuplicate).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Upload className="h-8 w-8 text-brand-yellow" />
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-main">
            Import Products
          </h1>
        </div>
        <p className="text-text-muted">
          Import products from AliExpress affiliate Excel export
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <Card className="lg:col-span-1 bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <FileSpreadsheet className="h-5 w-5" />
              Upload File
            </CardTitle>
            <CardDescription className="text-gray-600">
              Upload an Excel file (.xlsx) exported from AliExpress Affiliate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-text-muted mt-1">
                All imported products will be added to this category
              </p>
            </div>

            {/* Add category to existing products from uploaded file */}
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-700 mb-2 font-medium">
                📁 Add category to existing products from file
              </p>
              <p className="text-xs text-blue-600 mb-2">
                Products can have multiple categories. This adds the selected
                category without removing existing ones.
              </p>
              <Button
                variant="outline"
                onClick={handleUpdateExistingCategory}
                disabled={
                  updatingCategory ||
                  !selectedCategoryId ||
                  products.length === 0
                }
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                {updatingCategory ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  `Add Category (${products.length} products)`
                )}
              </Button>
              {updateResult && (
                <div className="text-xs mt-2">
                  <p className="text-green-600">
                    ✅ Added category to {updateResult.updated} products
                  </p>
                  {updateResult.skipped > 0 && (
                    <p className="text-gray-500">
                      ⏭️ {updateResult.skipped} already had this category
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="file">Excel File</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="mt-1.5 cursor-pointer"
              />
            </div>

            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>

            {file && (
              <div className="p-3 rounded-lg bg-brand-yellow/10 border border-brand-yellow/20">
                <p className="text-sm font-medium text-brand-yellow">
                  {file.name}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {products.length} products found
                </p>
              </div>
            )}

            {/* Field Mapping Info */}
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Expected Excel Columns:</p>
                  <ul className="space-y-0.5 text-blue-700">
                    <li>• ProductId, Image Url, Product Desc</li>
                    <li>• Origin Price, Discount Price, Currency</li>
                    <li>• Promotion Url, Sales180Day</li>
                    <li>• Positive Feedback, Commission rates</li>
                    <li>• Code Name/Value (optional)</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card className="lg:col-span-2 bg-white border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900">Preview</CardTitle>
                <CardDescription className="text-gray-600">
                  Review products before importing
                </CardDescription>
              </div>
              {products.length > 0 && (
                <div className="flex gap-3 text-sm flex-wrap">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    {validCount} new
                  </span>
                  {duplicatesInList > 0 && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <Copy className="h-4 w-4" />
                      {duplicatesInList} duplicates
                    </span>
                  )}
                  {invalidCount > 0 && (
                    <span className="flex items-center gap-1 text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      {invalidCount} invalid
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Upload an AliExpress Excel file to preview products</p>
                <p className="text-sm mt-2">
                  Export products from AliExpress Affiliate Portal → Products →
                  Export
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">Status</TableHead>
                      <TableHead className="w-16">Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead className="w-10">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.slice(0, 50).map((product, index) => (
                      <TableRow
                        key={index}
                        className={cn(
                          product.isDuplicate && "bg-amber-50",
                          !product.isValid &&
                            !product.isDuplicate &&
                            "bg-red-50"
                        )}
                      >
                        <TableCell>
                          {product.isDuplicate ? (
                            <div className="group relative">
                              <Copy className="h-5 w-5 text-amber-500" />
                              <div className="absolute left-0 top-6 hidden group-hover:block bg-amber-100 text-amber-700 text-xs p-2 rounded shadow-lg z-10 w-36">
                                Already exists (will skip)
                              </div>
                            </div>
                          ) : product.isValid ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <div className="group relative">
                              <AlertCircle className="h-5 w-5 text-red-500" />
                              <div className="absolute left-0 top-6 hidden group-hover:block bg-red-100 text-red-700 text-xs p-2 rounded shadow-lg z-10 w-48">
                                {product.errors.join(", ")}
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.image_url && (
                            <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                              <Image
                                src={product.image_url}
                                alt={product.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p
                            className="font-medium truncate"
                            title={product.title}
                          >
                            {product.title.substring(0, 50)}...
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {product.external_id}
                          </p>
                          {product.coupon_code && (
                            <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                              🎫 {product.coupon_code}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">
                              {product.currency} {product.price.toFixed(2)}
                            </p>
                            {product.original_price > product.price && (
                              <p className="text-xs text-gray-400 line-through">
                                {product.currency}{" "}
                                {product.original_price.toFixed(2)}
                              </p>
                            )}
                            {product.discount_percent > 0 && (
                              <span className="text-xs text-red-500">
                                -{product.discount_percent}%
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {product.sales_count.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-green-600 font-medium">
                            {product.commission_rate}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeProduct(index)}
                            className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {products.length > 50 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    Showing first 50 of {products.length} products
                  </p>
                )}
              </div>
            )}

            {/* Import Result */}
            {importResult && (
              <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-green-700 font-medium">
                  ✅ Import complete: {importResult.success} products imported
                  {importResult.skipped > 0 && (
                    <span className="text-amber-600">
                      , {importResult.skipped} skipped (duplicates)
                    </span>
                  )}
                  {importResult.failed > 0 && (
                    <span className="text-red-600">
                      , {importResult.failed} failed
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Progress Bar - shown during import */}
            {importing && (
              <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">
                    Importing products...
                  </span>
                  <span className="text-sm text-blue-600">
                    {progress.current} / {progress.total}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        progress.total > 0
                          ? (progress.current / progress.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>

                {/* Current product name */}
                {currentProductName && (
                  <p className="text-xs text-blue-600 truncate">
                    Currently: {currentProductName}
                  </p>
                )}

                {/* Percentage */}
                <p className="text-sm text-blue-700 font-medium mt-1">
                  {progress.total > 0
                    ? Math.round((progress.current / progress.total) * 100)
                    : 0}
                  % complete
                </p>
              </div>
            )}

            {/* Import Button */}
            {products.length > 0 && validCount > 0 && (
              <div className="mt-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    Products will be imported as <strong>DRAFT</strong> status
                  </p>
                  {duplicatesInList > 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      {duplicatesInList} duplicate(s) will be skipped
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {importing && (
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={handleImport}
                    disabled={importing || !selectedCategoryId}
                    className="bg-brand-yellow text-brand-black hover:bg-brand-yellow/90"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing... ({progress.current}/{progress.total})
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import {validCount} Products
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
