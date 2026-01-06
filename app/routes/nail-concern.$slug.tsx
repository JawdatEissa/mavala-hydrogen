import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import nailConcernsData from "../data/nail-concerns.json";

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
      {/* Breadcrumb */}
      <div className="py-6 px-4 md:px-8 bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto">
          <p className="font-['Archivo'] text-[11px] md:text-[12px] uppercase text-[#ae1932] tracking-wider">
            <a href="/" className="hover:underline">
              MAVACADEMY
            </a>
            {" > "}
            <a href="/nail-diagnosis" className="hover:underline">
              NAIL CONCERNS
            </a>
            {" > "}
            <span className="text-gray-600">{concern.name}</span>
          </p>
        </div>
      </div>

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
            
            {/* Product Images */}
            {concern.products && concern.products.length > 0 && (
              <div className="flex justify-center gap-10 md:gap-12 mb-10 flex-wrap">
                {concern.products.map((product: any, idx: number) => (
                  product.product_slug ? (
                    <a
                      key={idx}
                      href={`/products/${product.product_slug}`}
                      className="flex flex-col items-center group hover:opacity-80 transition-opacity duration-200"
                    >
                      <div className="w-[260px] h-[260px] md:w-[300px] md:h-[300px] bg-[#f5f5f5] flex items-center justify-center mb-4 p-6">
                        <img
                          src={product.src}
                          alt={product.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <p className="font-['Archivo'] text-[13px] md:text-[14px] text-gray-700 text-center font-medium max-w-[260px]">
                        {product.name}
                      </p>
                    </a>
                  ) : (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-[260px] h-[260px] md:w-[300px] md:h-[300px] bg-[#f5f5f5] flex items-center justify-center mb-4 p-6">
                        <img
                          src={product.src}
                          alt={product.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <p className="font-['Archivo'] text-[13px] md:text-[14px] text-gray-700 text-center font-medium max-w-[260px]">
                        {product.name}
                      </p>
                    </div>
                  )
                ))}
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

