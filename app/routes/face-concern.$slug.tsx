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
  const concernData = faceConcernsData.find(c => c.slug === slug);
  
  if (!concernData) {
    throw new Response("Face concern not found", { status: 404 });
  }

  // Map products to actual product data
  const products = concernData.products?.map(p => {
    // Use src from face-concerns.json directly, fallback to database if needed
    const images = p.src ? [p.src] : [];
    
    // Try to get product from database for additional info
    let productSlug = p.product_slug;
    const product = allProducts.find(
      prod => prod.slug === productSlug || 
              prod.slug === `all-products_${productSlug}` ||
              prod.slug.endsWith(`_${productSlug}`)
    );
    
    return {
      name: p.name,
      slug: p.product_slug,
      images: images.length > 0 ? images : (product?.images || []),
      price: product?.price || product?.price_from || "",
      category: product?.categories?.[0] || "",
    };
  }) || [];

  return json({ 
    concern: {
      ...concernData,
      products
    }
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.concern.title || 'Face Concern'} | Mavala Switzerland` },
    {
      name: "description",
      content: data?.concern.concern || "Expert skincare advice from Mavala Switzerland",
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
            {concern.solution.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Display products AFTER solution text */}
          {concern.products && concern.products.length > 0 && (
            <div className="mt-12">
              <h3 className="font-['Archivo'] text-[16px] md:text-[18px] font-semibold text-gray-800 uppercase mb-8">
                Recommended Products
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {concern.products.map((product) => {
                  const showBestsellerBadge = product.slug && isBestsellerSlug(product.slug);
                  const displayPrice = product.price ? formatPriceToCad(product.price) : "";
                  
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
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 text-left">
                        <h3 className="font-['Archivo'] text-[15px] md:text-[17px] font-medium text-gray-900 leading-snug">{product.name}</h3>
                        {product.category && (
                          <p className="font-['Archivo'] text-[13px] md:text-[14px] text-gray-500 mt-1">{product.category}</p>
                        )}
                        {displayPrice && (
                          <span className="font-['Archivo'] text-[14px] md:text-[16px] font-semibold text-[#ae1932] mt-1 block">{displayPrice}</span>
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

      {/* Bottom Spacing */}
      <div className="pb-16"></div>
    </div>
  );
}

