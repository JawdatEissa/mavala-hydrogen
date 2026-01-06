import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  CategoryHero,
  CategoryProductSection,
} from "../components/CategoryPageTemplate";
import { loadScrapedProducts } from "../lib/scraped-products";
import eyeBeautyData from "../data/eye-beauty-page.json";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const allProducts = loadScrapedProducts();

  // Map the eye beauty data with actual product data from scraped products
  const sections = eyeBeautyData.sections.map((section) => ({
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
    pageData: eyeBeautyData,
  });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Eye Beauty | Mavala Switzerland" },
    {
      name: "description",
      content:
        "Ophthalmologically tested eye care and makeup for sensitive eyes. Eye contour, lashes, brows, eyelids, and eye care serums.",
    },
  ];
};

export default function EyeBeautyPage() {
  const { sections } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-white pt-[90px]">
      {/* Hero Section */}
      <CategoryHero
        imageSrc="/eye-beauty-hero.jpg"
        alt="Ophthalmologically tested eye care and makeup for sensitive eyes"
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







