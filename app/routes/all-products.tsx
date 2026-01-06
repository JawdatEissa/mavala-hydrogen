import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { CategoryNav } from '../components/CategoryNav';
import { ProductGrid } from '../components/ProductCard';
import { loadScrapedProducts, getProductsByCategory, type ScrapedProduct } from '../lib/scraped-products.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') || 'All';
  
  // Load all scraped products
  const allProducts = loadScrapedProducts();
  
  // Filter by category
  const filteredProducts = getProductsByCategory(allProducts, category === 'All' ? null : category);
  
  return json({
    products: filteredProducts,
    category,
    totalCount: filteredProducts.length,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const category = data?.category || 'All';
  const title = category === 'All' 
    ? 'All Products | Mavala Switzerland' 
    : `${category} | Mavala Switzerland`;
  
  return [
    { title },
    { name: 'description', content: `Browse ${data?.totalCount || 0} Mavala products${category !== 'All' ? ` in ${category}` : ''}.` },
  ];
};

export default function AllProductsPage() {
  const { products, category, totalCount } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-white">
      {/* Banner Image */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
        <img
          src="/MAVALA_GROUP.jpg"
          alt="Mavala Group"
          className="w-full h-full object-cover object-center"
          style={{
            objectPosition: '50% 50%',
          }}
        />
      </div>

      {/* Category Navigation */}
      <CategoryNav />

      {/* Products Section */}
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Results Count */}
        <div className="mb-6 md:mb-8">
          <p className="font-['Archivo'] text-sm text-gray-600">
            {totalCount} {totalCount === 1 ? 'product' : 'products'}
            {category !== 'All' && ` in ${category}`}
          </p>
        </div>

        {/* Product Grid */}
        <ProductGrid products={products as any} columns={5} />
      </div>
    </div>
  );
}










