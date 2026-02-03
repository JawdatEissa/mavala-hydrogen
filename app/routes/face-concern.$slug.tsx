import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import faceConcernsData from "../data/face-concerns.json";
import { loadScrapedProducts } from "../lib/scraped-products.server";
import { isBestsellerSlug } from "../lib/bestsellers";
import { BestsellerBadge } from "../components/BestsellerBadge";
import { formatPriceToCad } from "../lib/currency";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { slug } = params;

  // Load all products for product mapping
  const allProducts = loadScrapedProducts();

  // Find the face concern data
  const concernData = faceConcernsData.find((c) => c.slug === slug);

  if (!concernData) {
    throw new Response("Face concern not found", { status: 404 });
  }

  // Map products to actual product data
  const products =
    concernData.products?.map((p) => {
      // Use src from face-concerns.json directly, fallback to database if needed
      const images = p.src ? [p.src] : [];

      // Try to get product from database for additional info
      let productSlug = p.product_slug;
      const product = allProducts.find(
        (prod) =>
          prod.slug === productSlug ||
          prod.slug === `all-products_${productSlug}` ||
          prod.slug.endsWith(`_${productSlug}`),
      );

      return {
        name: p.name,
        slug: p.product_slug,
        images: images.length > 0 ? images : product?.images || [],
        price: product?.price || product?.price_from || "",
        category: product?.categories?.[0] || "",
      };
    }) || [];

  return json({
    concern: {
      ...concernData,
      products,
    },
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.concern.title || "Face Concern"} | Mavala Switzerland` },
    {
      name: "description",
      content:
        data?.concern.concern ||
        "Expert skincare advice from Mavala Switzerland",
    },
  ];
};

export default function FaceConcernPage() {
  const { concern } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-white pt-[90px]">
      {/* Main Title with Icon */}
      <div className="py-8 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto text-center">
          {/* Circular Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-[200px] h-[200px] rounded-full overflow-hidden">
              <img
                src={`/face-concerns/${concern.slug}.jpg`}
                alt={concern.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h1 className="font-['Archivo'] text-[28px] md:text-[36px] font-bold text-[#ae1932] uppercase tracking-[1px] mb-12">
            {concern.title}
          </h1>
        </div>
      </div>

      {/* Concern Section */}
      <div className="py-8 px-4 md:px-8 bg-white">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="font-['Archivo'] text-[18px] md:text-[20px] font-bold text-gray-800 uppercase mb-4">
            Concern
          </h2>
          <p className="font-['Archivo'] text-[14px] md:text-[15px] text-gray-700 leading-relaxed">
            {concern.concern}
          </p>
        </div>
      </div>

      {/* Solution Section */}
      <div className="py-8 px-4 md:px-8 bg-white">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="font-['Archivo'] text-[18px] md:text-[20px] font-bold text-gray-800 uppercase mb-6">
            Solution
          </h2>

          {/* Solution Text FIRST */}
          <div className="font-['Archivo'] text-[14px] md:text-[15px] text-gray-700 leading-relaxed space-y-4 mb-12">
            {concern.solution.split("\n\n").map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Display products AFTER solution text */}
          {concern.products && concern.products.length > 0 && (
            <div className="mt-12">
              <h3 className="font-['Archivo'] text-[16px] md:text-[18px] font-semibold text-gray-800 uppercase mb-8">
                Recommended Products
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                {concern.products.map((product) => {
                  const showBestsellerBadge =
                    product.slug && isBestsellerSlug(product.slug);
                  const displayPrice = product.price
                    ? formatPriceToCad(product.price)
                    : "";

                  return (
                    <Link
                      key={product.slug}
                      to={`/products/${product.slug}`}
                      className="product-card group relative flex flex-col w-full"
                    >
                      <div className="relative overflow-hidden bg-[#f5f5f5] rounded-[3px] aspect-[4/5] flex items-center justify-center p-8 md:p-10 transition-shadow duration-300 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                        {showBestsellerBadge && <BestsellerBadge />}
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400 text-xs">
                              No image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 text-left">
                        <h3 className="font-['Archivo'] text-[15px] md:text-[17px] font-medium text-gray-900 leading-snug">
                          {product.name}
                        </h3>
                        {product.category && (
                          <p className="font-['Archivo'] text-[13px] md:text-[14px] text-gray-500 mt-1">
                            {product.category}
                          </p>
                        )}
                        {displayPrice && (
                          <span className="font-['Archivo'] text-[14px] md:text-[16px] font-semibold text-[#ae1932] mt-1 block">
                            {displayPrice}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Back to Face Concerns */}
      <div className="flex justify-center py-12 px-4 md:px-8">
        <a
          href="/face-concerns"
          className="inline-block px-8 py-3 border border-[#ae1932] bg-transparent text-[#ae1932] font-['Archivo'] text-[13px] font-medium uppercase tracking-wider hover:bg-[#ae1932] hover:text-white transition-colors duration-150"
        >
          ← BACK TO ALL CONCERNS
        </a>
      </div>

      {/* MAVALA CARES Section */}
      <section className="bg-[#f6f3ef] py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <h2 className="font-['Archivo'] text-[32px] md:text-[38px] font-medium text-[#ae1932] uppercase text-center tracking-[1px] mb-4">
            MAVALA CARES
          </h2>

          {/* Subtitle */}
          <p className="text-center text-gray-600 text-[14px] md:text-[15px] mb-10 max-w-3xl mx-auto">
            We care about the planet. We aim to minimise our impact on the
            environment through the following measures:
          </p>

          {/* Three Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Ingredients Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-['Archivo'] text-[16px] font-semibold text-gray-800 mb-3">
                Ingredients
              </h3>
              <p className="text-gray-600 text-[13px] leading-relaxed">
                We source our ingredients and raw materials from the nearest
                suppliers in Switzerland to reduce our carbon footprint. We also
                increasingly use ingredients that are readily biodegradable. In
                particular, we do not use plastic microbeads nor
                cyclopentasiloxane (D5), which contribute to ocean pollution.
              </p>
            </div>

            {/* Packaging Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-['Archivo'] text-[16px] font-semibold text-gray-800 mb-3">
                Packaging
              </h3>
              <p className="text-gray-600 text-[13px] leading-relaxed">
                Whenever possible, we package our products without a box or
                cellophane and in recycled and recyclable materials (including
                plastic and glass) to reduce waste. We have also implemented
                clear labelling on product packaging to assist you in knowing
                which part of the packaging can be recycled and how.
              </p>
            </div>

            {/* Manufacturing Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-['Archivo'] text-[16px] font-semibold text-gray-800 mb-3">
                Manufacturing
              </h3>
              <p className="text-gray-600 text-[13px] leading-relaxed">
                Whenever possible, we manufacture under cold conditions to
                reduce energy consumption. We are also implementing strict waste
                separation and recycling processes in our production site and
                warehouses, including that of our Canadian distributor in
                Burnaby.
              </p>
            </div>
          </div>

          {/* Cruelty Free Statement */}
          <div className="bg-white rounded-lg p-6 shadow-sm max-w-3xl mx-auto">
            <p className="text-[#ae1932] text-[14px] md:text-[15px] text-center font-medium">
              We are 100% cruelty free, we do not test any of our ingredients or
              products on animals.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
