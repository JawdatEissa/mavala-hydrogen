import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ProductGrid } from "../components/ProductCard";
import { CategoryNav } from "../components/CategoryNav";
import {
  loadScrapedProducts,
  getProductsByCategory,
  CATEGORIES,
} from "../lib/scraped-products";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    const { handle } = params;
    const url = new URL(request.url);
    const categoryParam = url.searchParams.get("category");
    const sortParam = url.searchParams.get("sort") || "default";
    // Ignore refresh param - it's just for forcing navigation
    url.searchParams.delete("refresh");

    // Load all scraped products
    const allProducts = loadScrapedProducts();

    // Debug logging
    console.log("Collections loader - handle:", handle);
    console.log("Collections loader - allProducts count:", allProducts.length);

    if (allProducts.length === 0) {
      console.error("No products loaded! Check scraped-products.ts");
    }

    let filteredProducts = allProducts;
    let title = "All Products";
    let category = "All";

    // If handle is "all", use category param if provided, otherwise show all
    if (handle === "all") {
      if (categoryParam) {
        category = categoryParam;
        filteredProducts = getProductsByCategory(allProducts, category);
        title = category;
      } else {
        filteredProducts = allProducts;
        title = "All Products";
      }
    } else if (handle) {
      // Map handle to category name
      const handleToCategory: Record<string, string> = {
        "nail-care": "Cuticle Care",
        "nail-polish": "Nail Colour",
        accessories: "Manicure Essentials",
        "hand-care": "Hand care",
        "foot-care": "Foot Care",
        "eye-care": "Eye Colour",
        "eye-beauty": "Eyebrows & Lashes",
        lips: "Lip Colour",
        skincare: "Skincare",
        complexion: "Complexion",
        "hair-body": "Hair & Body",
        gifts: "Gift Sets",
      };

      category = handleToCategory[handle] || handle.replace(/-/g, " ");
      filteredProducts = getProductsByCategory(allProducts, category);
      title = category;
    }

    // Apply sorting
    if (sortParam === "a-z") {
      filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortParam === "z-a") {
      filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortParam === "price-low-high") {
      filteredProducts.sort((a, b) => {
        const priceA = parseFloat(
          (a.price_from || a.price || "0").replace(/[^0-9.]/g, "")
        );
        const priceB = parseFloat(
          (b.price_from || b.price || "0").replace(/[^0-9.]/g, "")
        );
        return priceA - priceB;
      });
    } else if (sortParam === "price-high-low") {
      filteredProducts.sort((a, b) => {
        const priceA = parseFloat(
          (a.price_from || a.price || "0").replace(/[^0-9.]/g, "")
        );
        const priceB = parseFloat(
          (b.price_from || b.price || "0").replace(/[^0-9.]/g, "")
        );
        return priceB - priceA;
      });
    }

    console.log(
      "Collections loader - filteredProducts count:",
      filteredProducts.length
    );

    return json({
      handle: handle || "all",
      title,
      category,
      products: filteredProducts,
      totalCount: filteredProducts.length,
      sort: sortParam,
      error: undefined as string | undefined,
    });
  } catch (error) {
    console.error("Error in collections loader:", error);
    // Return empty state instead of crashing
    return json({
      handle: params.handle || "all",
      title: "All Products",
      category: "All",
      products: [],
      totalCount: 0,
      sort: "default",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.title} | Mavala Switzerland` },
    {
      name: "description",
      content: `Browse ${data?.totalCount || 0} Mavala products${
        data?.category && data.category !== "All" ? ` in ${data.category}` : ""
      }.`,
    },
  ];
};

export default function CollectionPage() {
  const data = useLoaderData<typeof loader>();
  const { title, products, totalCount, handle, error } = data;

  // Debug logging
  console.log("CollectionPage render - handle:", handle);
  console.log("CollectionPage render - products count:", products?.length || 0);
  console.log("CollectionPage render - totalCount:", totalCount);
  console.log("CollectionPage render - error:", error);

  // For "all" collection, show the full all-products page layout
  const isAllProducts = handle === "all";

  if (isAllProducts) {
    return (
      <div className="min-h-screen bg-white pt-[90px]">
        {/* Banner Image */}
        <div className="relative w-full h-[calc(100vh-90px)] overflow-hidden z-0">
          <img
            src="/MAVALA_GROUP.jpg"
            alt="Mavala Group"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Category Navigation */}
        <CategoryNav />

        {/* Products Section - Full width 4-column layout */}
        <div className="w-full px-6 md:px-10 lg:px-16 py-8 md:py-12">
          {/* Product Count */}
          <div className="mb-8">
            <p className="text-gray-600 font-['Archivo'] text-sm">
              {totalCount} {totalCount === 1 ? "product" : "products"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800 font-['Archivo']">
                Error loading products: {error}
              </p>
              <p className="text-red-600 font-['Archivo'] text-sm mt-2">
                Check server console for details.
              </p>
            </div>
          )}

          {/* Product Grid */}
          {products && products.length > 0 ? (
            <ProductGrid products={products as any} columns={5} />
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-600 font-['Archivo'] mb-4">
                No products found.
              </p>
              {error && (
                <p className="text-red-600 font-['Archivo'] text-sm">
                  Error: {error}
                </p>
              )}
              {!error && (
                <p className="text-gray-500 font-['Archivo'] text-sm">
                  Check browser console and server logs for debugging
                  information.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // For other collections, use simpler layout
  return (
    <div className="min-h-screen bg-white pt-[90px] md:pt-[90px]">
      {/* Collection Header */}
      <div className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-['Archivo'] font-bold tracking-[0.15em] uppercase text-gray-900">
            {title}
          </h1>
          <p className="text-gray-600 mt-2 font-['Archivo']">
            {totalCount} {totalCount === 1 ? "product" : "products"}
          </p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4 py-12">
        {products.length > 0 ? (
          <ProductGrid products={products as any} columns={5} />
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 font-['Archivo']">
              No products found in this collection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
