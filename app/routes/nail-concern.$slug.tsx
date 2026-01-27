import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import nailConcernsData from "../data/nail-concerns.json";
import { isBestsellerSlug } from "../lib/bestsellers";
import { BestsellerBadge } from "../components/BestsellerBadge";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { slug } = params;
  
  // Find the nail concern by slug
  const concern = nailConcernsData.find((c: any) => c.slug === slug);
  
  if (!concern) {
    throw new Response("Nail concern not found", { status: 404 });
  }
  
  return json({ concern });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: "Nail Concern Not Found" }];
  }
  
  return [
    { title: `${data.concern.name} | Mavala Switzerland` },
    {
      name: "description",
      content: data.concern.concern || "Learn about this nail concern and find the right products.",
    },
  ];
};

export default function NailConcernPage() {
  const { concern } = useLoaderData<typeof loader>();
  
  return (
    <div className="min-h-screen bg-white pt-[90px]">
      {/* Main Content */}
      <section className="py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-[1000px] mx-auto">
          {/* Main Nail Image */}
          {concern.main_image && (
            <div className="flex justify-center mb-8">
              <img
                src={concern.main_image.src}
                alt={concern.main_image.alt}
                className="max-w-[200px] object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="font-['Archivo'] text-[28px] md:text-[36px] font-bold text-[#ae1932] uppercase text-center tracking-[1px] mb-12">
            {concern.name}
          </h1>

          {/* CONCERN Section */}
          <div className="mb-12">
            <h2 className="font-['Archivo'] text-[20px] md:text-[24px] font-bold text-gray-800 uppercase tracking-wide mb-6">
              CONCERN
            </h2>
            <p className="font-['Archivo'] text-[15px] md:text-[16px] leading-relaxed text-gray-800">
              {concern.concern}
            </p>
          </div>

          {/* SOLUTION Section */}
          <div className="mb-12">
            <h2 className="font-['Archivo'] text-[20px] md:text-[24px] font-bold text-gray-800 uppercase tracking-wide mb-8">
              SOLUTION
            </h2>
            
            {/* Product Images - Grid matching nail-care styling */}
            {concern.products && concern.products.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-10 max-w-3xl mx-auto">
                {concern.products.map((product: any, idx: number) => {
                  const showBestsellerBadge = product.product_slug && isBestsellerSlug(product.product_slug);
                  
                  return product.product_slug ? (
                    <a
                      key={idx}
                      href={`/products/${product.product_slug}`}
                      className="flex flex-col group"
                    >
                      <div className="relative overflow-hidden bg-[#f5f5f5] rounded-[3px] aspect-[4/5] flex items-center justify-center p-6 transition-shadow duration-300 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                        {showBestsellerBadge && <BestsellerBadge />}
                        <img
                          src={product.src}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="font-['Archivo'] text-[14px] md:text-[15px] text-gray-800 text-left font-medium mt-3">
                        {product.name}
                      </p>
                    </a>
                  ) : (
                    <div key={idx} className="flex flex-col">
                      <div className="relative overflow-hidden bg-[#f5f5f5] rounded-[3px] aspect-[4/5] flex items-center justify-center p-6">
                        <img
                          src={product.src}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="font-['Archivo'] text-[14px] md:text-[15px] text-gray-800 text-left font-medium mt-3">
                        {product.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Solution Text */}
            <p className="font-['Archivo'] text-[15px] md:text-[16px] leading-relaxed text-gray-800">
              {concern.solution}
            </p>
          </div>

          {/* Back to Nail Concerns */}
          <div className="flex justify-center mt-12">
            <a
              href="/nail-diagnosis"
              className="inline-block px-8 py-3 border border-[#ae1932] bg-transparent text-[#ae1932] font-['Archivo'] text-[13px] font-medium uppercase tracking-wider hover:bg-[#ae1932] hover:text-white transition-colors duration-150"
            >
              ← BACK TO ALL CONCERNS
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

