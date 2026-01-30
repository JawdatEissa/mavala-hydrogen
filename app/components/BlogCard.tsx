import { Link } from "@remix-run/react";
import type { BlogPost } from "../lib/blog-types";
import {
  getFeaturedImage,
  formatBlogDate,
  getReadingTime,
} from "../lib/blog-types";

interface BlogCardProps {
  blog: BlogPost;
  variant?: "default" | "featured" | "compact";
}

export function BlogCard({ blog, variant = "default" }: BlogCardProps) {
  const featuredImage = getFeaturedImage(blog);

  // Title case the title
  const formattedTitle = blog.metadata.title
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  if (variant === "featured") {
    return <FeaturedBlogCard blog={blog} />;
  }

  if (variant === "compact") {
    return <CompactBlogCard blog={blog} />;
  }

  return (
    <Link to={`/blog/${blog.slug}`} className="group block">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 mb-4">
        <img
          src={featuredImage}
          alt={blog.metadata.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Reading time badge */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full">
            {getReadingTime(blog)} min read
          </span>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {blog.metadata.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] uppercase tracking-wider text-[#E31837]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="font-marcellus text-base md:text-lg text-gray-900 group-hover:text-[#E31837] transition-colors leading-snug mb-2">
          {formattedTitle}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {blog.metadata.excerpt}
        </p>

        {/* Date */}
        <span className="text-xs text-gray-400">
          {formatBlogDate(blog.metadata.date)}
        </span>
      </div>
    </Link>
  );
}

// Featured Blog Card - Large horizontal layout
function FeaturedBlogCard({ blog }: { blog: BlogPost }) {
  const featuredImage = getFeaturedImage(blog);

  const formattedTitle = blog.metadata.title
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return (
    <Link to={`/blog/${blog.slug}`} className="group block">
      <div className="grid md:grid-cols-2 gap-6 md:gap-10 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
        {/* Featured Image */}
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[400px] overflow-hidden">
          <img
            src={featuredImage}
            alt={blog.metadata.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {/* Featured Badge */}
          <div className="absolute top-4 left-4">
            <span className="inline-block bg-[#E31837] text-white text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full">
              Latest
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-10 flex flex-col justify-center">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.metadata.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-wider text-[#E31837] bg-[#E31837]/5 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h2 className="font-marcellus text-xl md:text-2xl lg:text-3xl text-gray-900 mb-4 group-hover:text-[#E31837] transition-colors leading-tight">
            {formattedTitle}
          </h2>

          {/* Excerpt */}
          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
            {blog.metadata.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{formatBlogDate(blog.metadata.date)}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{getReadingTime(blog)} min read</span>
          </div>

          {/* Read More */}
          <div className="mt-6">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#E31837] group-hover:gap-3 transition-all">
              Read Article
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Compact Blog Card - For sidebars or related posts
function CompactBlogCard({ blog }: { blog: BlogPost }) {
  const featuredImage = getFeaturedImage(blog);

  const formattedTitle = blog.metadata.title
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return (
    <Link to={`/blog/${blog.slug}`} className="group flex gap-4">
      {/* Image */}
      <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <img
          src={featuredImage}
          alt={blog.metadata.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 group-hover:text-[#E31837] transition-colors line-clamp-2 mb-1">
          {formattedTitle}
        </h4>
        <span className="text-xs text-gray-400">
          {formatBlogDate(blog.metadata.date)}
        </span>
      </div>
    </Link>
  );
}

// Grid wrapper for blog listings
export function BlogGrid({
  blogs,
  columns = 3,
}: {
  blogs: BlogPost[];
  columns?: 2 | 3 | 4;
}) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 md:gap-8`}>
      {blogs.map((blog) => (
        <BlogCard key={blog.slug} blog={blog} />
      ))}
    </div>
  );
}

export default BlogCard;
