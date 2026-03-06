import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import faceConcernsData from "../data/face-concerns.json";
import { loadScrapedProducts } from "../lib/scraped-products.server";
import { MavalaCares } from "../components/MavalaCares";
import { ProductCard } from "../components/ProductCard";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { slug } = params;

  const allProducts = loadScrapedProducts();

  const concernData = faceConcernsData.find((c) => c.slug === slug);

  if (!concernData) {
    throw new Response("Face concern not found", { status: 404 });
  }

  const products =
    concernData.products?.map((p) => {
      const productSlug = p.product_slug;
      const product = allProducts.find(
        (prod) =>
          prod.slug === productSlug ||
          prod.slug === `all-products_${productSlug}` ||
          prod.slug.endsWith(`_${productSlug}`),
      );

      if (product) {
        return {
          ...product,
          slug: productSlug,
        };
      }

      return {
        url: `/products/${productSlug}`,
        slug: productSlug,
        title: p.name,
        price: "",
        images: p.src ? [p.src] : [],
        categories: [],
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

          {concern.products && concern.products.length > 0 && (
            <div className="mt-12">
              <h3 className="font-['Archivo'] text-[16px] md:text-[18px] font-semibold text-gray-800 uppercase mb-8">
                Recommended Products
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {concern.products.map((product: any) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
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

      <MavalaCares />
    </div>
  );
}
