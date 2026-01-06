import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  CategoryHero,
  CategoryProductSection,
} from "../components/CategoryPageTemplate";
import { loadScrapedProducts } from "../lib/scraped-products.server";
import footCareData from "../data/foot-care-page.json";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const allProducts = loadScrapedProducts();

  // Map the foot care data with actual product data from scraped products
  const sections = footCareData.sections.map((section) => ({
    title: section.title,
    subtitle: section.subtitle,
    products: section.products.map((product) => {
      // Find matching product in scraped data
      const scrapedProduct = allProducts.find((p) => p.slug === product.slug);

      return {
        slug: product.slug,
        title: product.name,
        price: product.price,
        tagline: product.description,
        images: scrapedProduct?.images || [],
        url: `/products/${product.slug}`,
      };
    }),
  }));

  return json({
    sections,
    pageData: footCareData,
  });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Foot Care | Mavala Switzerland" },
    {
      name: "description",
      content:
        "Comfort for feet as smooth as waterlily petals. Swiss foot care products for smooth, soft, and fresh feet.",
    },
  ];
};

export default function FootCarePage() {
  const { sections } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-white pt-[90px]">
      {/* Hero Section */}
      <CategoryHero
        imageSrc="/foot-care-hero-new.png"
        alt="Foot Care - Comfort for feet"
        height="90vh"
        objectPosition="50% 50%"
      />

      {/* Product Sections */}
      {sections.map((section, idx) => (
        <CategoryProductSection
          key={idx}
          title={section.title}
          subtitle={section.subtitle}
          products={section.products}
        />
      ))}

      {/* Bottom Spacing */}
      <div className="pb-16"></div>
    </div>
  );
}

