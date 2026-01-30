import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import blogData from "../data/blogs.json";
import type { BlogPost, BlogData } from "../lib/blog-types";
import {
  getFeaturedImage,
  formatBlogDate,
  getReadingTime,
} from "../lib/blog-types";

export const meta: MetaFunction = () => {
  return [
    { title: "Blog | Beauty Tips & Nail Care | Mavala Switzerland" },
    {
      name: "description",
      content:
        "Discover beauty tips, nail care advice, manicure tutorials, and skincare insights from Mavala Switzerland experts.",
    },
  ];
};

export const loader = async () => {
  const data = blogData as BlogData;
  return json({ blogs: data.blogs });
};

// Get all unique tags from blogs
function getAllTags(blogs: BlogPost[]): string[] {
  const tagSet = new Set<string>();
  blogs.forEach((blog) => {
    blog.metadata.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

export default function BlogIndex() {
  const { blogs } = useLoaderData<typeof loader>();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get featured blog (first one - most recent)
  const featuredBlog = blogs[0];
  const otherBlogs = blogs.slice(1);

  // Filter blogs by tag
  const filteredBlogs = selectedTag
    ? otherBlogs.filter((blog) =>
        blog.metadata.tags.some(
          (tag) => tag.toLowerCase() === selectedTag.toLowerCase(),
        ),
      )
    : otherBlogs;

  const allTags = getAllTags(blogs as BlogPost[]);

  return (
    <div className="pt-[104px] md:pt-[112px] min-h-screen bg-white">
      {/* Hero Section with Featured Blog */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto px-6 md:px-10 lg:px-16 max-w-[1800px] py-12 md:py-16">
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-14">
            <p className="text-base md:text-lg uppercase tracking-[0.3em] text-[#E31837] mb-4">
              The Mavala Journal
            </p>
            <h1 className="font-marcellus text-5xl md:text-6xl lg:text-7xl text-gray-900 mb-5">
              Beauty & Wellness
            </h1>
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-12 h-px bg-[#E31837]/30" />
              <div className="w-2 h-2 rounded-full bg-[#E31837]" />
              <div className="w-12 h-px bg-[#E31837]/30" />
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Expert tips, tutorials, and insights from Mavala Switzerland
            </p>
          </div>

          {/* Featured Blog Card */}
          {featuredBlog && (
            <Link
              to={`/blog/${featuredBlog.slug}`}
              className="group block max-w-[1400px] mx-auto"
            >
              <div className="grid md:grid-cols-2 gap-6 md:gap-12 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
                {/* Featured Image */}
                <div className="relative aspect-[4/3] md:aspect-[4/5] overflow-hidden">
                  <img
                    src={getFeaturedImage(featuredBlog as BlogPost)}
                    alt={featuredBlog.metadata.title}
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
                <div className="p-6 md:p-10 lg:p-12 flex flex-col justify-center">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {featuredBlog.metadata.tags.slice(0, 3).map((tag) => (
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
                    {featuredBlog.metadata.title
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase(),
                      )
                      .join(" ")}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
                    {featuredBlog.metadata.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{formatBlogDate(featuredBlog.metadata.date)}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>
                      {getReadingTime(featuredBlog as BlogPost)} min read
                    </span>
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
          )}
        </div>
      </section>

      {/* Filter Tags */}
      <section className="border-b border-gray-100">
        <div className="mx-auto px-6 md:px-10 lg:px-16 max-w-[1800px] py-5">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-5 py-2 text-xs uppercase tracking-wider rounded-full transition-all ${
                selectedTag === null
                  ? "bg-[#E31837] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {allTags.slice(0, 14).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-5 py-2 text-xs uppercase tracking-wider rounded-full transition-all ${
                  selectedTag === tag
                    ? "bg-[#E31837] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-12 md:py-16">
        <div className="mx-auto px-6 md:px-10 lg:px-16 max-w-[1800px]">
          {/* Section Title */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-marcellus text-xl md:text-2xl text-gray-900">
              {selectedTag ? `Posts tagged "${selectedTag}"` : "More Articles"}
            </h2>
            <span className="text-xs text-gray-400">
              {filteredBlogs.length}{" "}
              {filteredBlogs.length === 1 ? "post" : "posts"}
            </span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredBlogs.map((blog) => (
              <BlogCard key={blog.slug} blog={blog as BlogPost} />
            ))}
          </div>

          {/* Empty State */}
          {filteredBlogs.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">
                No posts found with this tag.
              </p>
              <button
                onClick={() => setSelectedTag(null)}
                className="text-[#E31837] text-sm font-medium hover:underline"
              >
                View all posts
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-marcellus text-2xl md:text-3xl text-gray-900 mb-4">
              Stay Beautiful
            </h3>
            <p className="text-gray-600 mb-8">
              Subscribe to receive the latest beauty tips, tutorials, and
              product news from Mavala Switzerland.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/the-brand"
                className="inline-flex items-center justify-center gap-2 bg-[#E31837] text-white px-8 py-3 text-sm uppercase tracking-wider hover:bg-gray-900 transition-colors"
              >
                Discover Mavala
              </Link>
              <Link
                to="/all-products"
                className="inline-flex items-center justify-center gap-2 border border-gray-900 text-gray-900 px-8 py-3 text-sm uppercase tracking-wider hover:bg-gray-900 hover:text-white transition-colors"
              >
                Shop Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Blog Card Component
function BlogCard({ blog }: { blog: BlogPost }) {
  const featuredImage = getFeaturedImage(blog);

  return (
    <Link to={`/blog/${blog.slug}`} className="group block">
      {/* Image Container */}
      <div className="relative aspect-[4/3] md:aspect-square overflow-hidden rounded-xl bg-gray-100 mb-5">
        <img
          src={featuredImage}
          alt={blog.metadata.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

        {/* Reading time badge */}
        <div className="absolute bottom-4 right-4">
          <span className="bg-white/95 text-gray-600 text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg">
            {getReadingTime(blog)} min
          </span>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {blog.metadata.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[11px] uppercase tracking-wider text-[#E31837]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="font-marcellus text-lg md:text-xl text-gray-900 group-hover:text-[#E31837] transition-colors leading-tight mb-3">
          {blog.metadata.title
            .split(" ")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
            )
            .join(" ")}
        </h3>

        {/* Excerpt */}
        <p className="text-sm md:text-base text-gray-500 line-clamp-2 mb-3">
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
