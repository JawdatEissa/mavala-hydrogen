import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  CategoryHero,
  CategoryProductSection,
} from "../components/CategoryPageTemplate";
import { loadScrapedProducts } from "../lib/scraped-products";
import handCareData from "../data/hand-care-page.json";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const allProducts = loadScrapedProducts();

  // Map the hand care data with actual product data from scraped products
  const sections = handCareData.sections.map((section) => ({
    title: section.title,
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
    pageData: handCareData,
  });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Hand Care | Mavala Switzerland" },
    {
      name: "description",
      content:
        "Swiss Hand Care Program to repair and protect hands. Daily care and specific treatments for smooth, youthful hands.",
    },
  ];
};

export default function HandCarePage() {
  const { sections } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-white pt-[90px]">
      {/* Hero Section */}
      <CategoryHero
        imageSrc="/hand-care-hero.jpg"
        alt="Swiss Hand Care Program to repair and protect hands"
        height="90vh"
        objectPosition="50% 50%"
      />

      {/* Product Sections */}
      {sections.map((section, idx) => (
        <CategoryProductSection
          key={idx}
          title={section.title}
          products={section.products}
        />
      ))}

      {/* Bottom Spacing */}
      <div className="pb-16"></div>
    </div>
  );
}
