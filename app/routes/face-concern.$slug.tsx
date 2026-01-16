import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import faceConcernsData from "../data/face-concerns.json";
import { loadScrapedProducts } from "../lib/scraped-products.server";

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
    if (!productSlug.startsWith('all-products_')) {
      productSlug = `all-products_${p.product_slug}`;
    }
    const product = allProducts.find(prod => prod.slug === productSlug || prod.slug === p.product_slug);
    
    return {
      name: p.name,
      slug: p.product_slug,
      images: images.length > 0 ? images : (product?.images || []),
      price: product?.price || "",
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {concern.products.map((product) => (
                  <Link
                    key={product.product_slug || product.slug}
                    to={`/products/${product.product_slug || product.slug}`}
                    className="flex flex-col items-center group"
                  >
                    <div className="w-full aspect-square mb-3 bg-[#f5f5f5] rounded-[3px] flex items-center justify-center p-4 transition-shadow duration-300 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#f5f5f5] rounded-[3px] flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <p className="font-['Archivo'] text-[12px] md:text-[13px] text-center text-gray-600 font-medium">
                      {product.name}
                    </p>
                  </Link>
                ))}
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

