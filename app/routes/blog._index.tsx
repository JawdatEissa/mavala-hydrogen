import type { MetaFunction } from '@remix-run/node';
import { BlogGrid } from '../components/BlogCard';
import { blogPosts } from '../lib/mock-data';

export const meta: MetaFunction = () => {
  return [
    { title: 'Blog | Mavala Switzerland' },
    { name: 'description', content: 'Beauty tips, nail care advice, and product news from Mavala Switzerland.' },
  ];
};

export default function BlogIndex() {
  return (
    <div className="pt-[104px] md:pt-[112px]">
      {/* Blog Header */}
      <div className="bg-mavala-light-gray py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-light tracking-[0.15em] uppercase">
            Mavala Blog
          </h1>
          <p className="text-mavala-gray mt-2">
            Tips, trends, and beauty advice from our experts
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {['All', 'Tips', 'Manicure', 'Nail Care', 'Makeup', 'Skincare'].map((cat) => (
              <button
                key={cat}
                className="text-sm uppercase tracking-wider text-mavala-gray hover:text-mavala-red transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="container mx-auto px-4 py-12">
        <BlogGrid posts={blogPosts} />
        
        {/* Load More */}
        {blogPosts.length > 12 && (
          <div className="text-center mt-12">
            <button className="btn-secondary">
              Load More Posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

