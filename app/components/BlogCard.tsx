import { Link } from "@remix-run/react";
import type { BlogPost } from "../lib/mock-data";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const slug = post.slug || post.url.split("/").pop() || "";

  // Get first image from content blocks
  const featuredImage = post.content_blocks.find(
    (b) => b.type === "image"
  )?.src;

  // Placeholder images for demo
  const placeholders = [
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=300&fit=crop",
  ];

  return (
    <Link to={`/blog/${slug}`} className="block group">
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 mb-3">
        <img
          src={
            featuredImage ||
            placeholders[Math.floor(Math.random() * placeholders.length)]
          }
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Title */}
      <h3 className="text-sm text-gray-800 group-hover:text-[#E31837] transition-colors leading-relaxed">
        {post.title}
      </h3>
    </Link>
  );
}

// Grid wrapper for blog listings
export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {posts.map((post) => (
        <BlogCard key={post.slug || post.url} post={post} />
      ))}
    </div>
  );
}
