import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import nailConcernsData from "../data/nail-concerns.json";
import { MavalaCares } from "../components/MavalaCares";
import { ProductCard } from "../components/ProductCard";
import { loadScrapedProducts } from "../lib/scraped-products.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { slug } = params;

  const allProducts = loadScrapedProducts();

  const concernData = nailConcernsData.find((c: any) => c.slug === slug);

  if (!concernData) {
    throw new Response("Nail concern not found", { status: 404 });
  }

  const products =
    concernData.products?.map((p: any) => {
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
        url: p.product_url || `/products/${productSlug}`,
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
  if (!data) {
    return [{ title: "Nail Concern Not Found" }];
  }

  return [
    { title: `${data.concern.name} | Mavala Switzerland` },
    {
      name: "description",
      content:
        data.concern.concern ||
        "Learn about this nail concern and find the right products.",
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

            {concern.products && concern.products.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
                {concern.products.map((product: any) => (
                  <ProductCard key={product.slug} product={product} />
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

      <MavalaCares />
    </div>
  );
}
