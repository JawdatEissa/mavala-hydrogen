import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import blogData from "../data/blogs.json";
import type {
  BlogPost,
  BlogData,
  BlogContentBlock,
  BlogParagraphBlock,
  BlogHeadingBlock,
  BlogImageBlock,
  BlogListBlock,
} from "../lib/blog-types";
import {
  getFeaturedImage,
  formatBlogDate,
  getReadingTime,
  getLocalImagePath,
} from "../lib/blog-types";
import { getProductLink, getProductTitle } from "../lib/product-mapping";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.blog) {
    return [{ title: "Blog Post Not Found | Mavala Switzerland" }];
  }

  const title = data.blog.metadata.title
    .split(" ")
    .map(
      (word: string) =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(" ");

  return [
    { title: `${title} | Mavala Switzerland` },
    { name: "description", content: data.blog.metadata.excerpt },
    { property: "og:title", content: title },
    { property: "og:description", content: data.blog.metadata.excerpt },
    { property: "og:image", content: data.blog.metadata.featured_image },
  ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { handle } = params;
  const data = blogData as BlogData;

  const blog = data.blogs.find((b) => b.slug === handle);

  if (!blog) {
    throw new Response("Not Found", { status: 404 });
  }

  // Get related posts (exclude current, take 3)
  const relatedPosts = data.blogs.filter((b) => b.slug !== handle).slice(0, 3);

  return json({ blog, relatedPosts });
};

// Render a single content block
function ContentBlockRenderer({
  block,
  blogSlug,
}: {
  block: BlogContentBlock;
  blogSlug: string;
}) {
  switch (block.type) {
    case "paragraph":
      return <ParagraphBlock block={block} />;
    case "heading":
      return <HeadingBlock block={block} />;
    case "image":
      return <ImageBlock block={block} blogSlug={blogSlug} />;
    case "unordered_list":
    case "ordered_list":
      return <ListBlock block={block} />;
    default:
      return null;
  }
}

// Paragraph Block
function ParagraphBlock({ block }: { block: BlogParagraphBlock }) {
  // Check if it's a photo credit (small text)
  const isCaption =
    block.content.toLowerCase().startsWith("pic credit") ||
    block.content.toLowerCase().startsWith("photo credit");

  if (isCaption) {
    return (
      <p
        className="text-sm text-gray-500 italic mb-8"
        dangerouslySetInnerHTML={{ __html: formatLinks(block.html) }}
      />
    );
  }

  return (
    <p
      className="text-sm md:text-base text-gray-600 leading-relaxed mb-5"
      dangerouslySetInnerHTML={{ __html: formatLinks(block.html) }}
    />
  );
}

// Heading Block
function HeadingBlock({ block }: { block: BlogHeadingBlock }) {
  const content = block.content;

  switch (block.level) {
    case 1:
      return (
        <h1 className="font-marcellus text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-6 mt-12">
          {content}
        </h1>
      );
    case 2:
      return (
        <h2 className="font-marcellus text-xl md:text-2xl lg:text-3xl text-gray-900 mb-5 mt-10">
          {content}
        </h2>
      );
    case 3:
      return (
        <h3 className="text-lg md:text-xl font-medium text-gray-800 mb-4 mt-8">
          {content}
        </h3>
      );
    case 4:
      return (
        <h4 className="text-base md:text-lg font-medium text-gray-800 mb-3 mt-6">
          {content}
        </h4>
      );
    default:
      return (
        <h5 className="text-base font-medium text-gray-800 mb-2 mt-4">
          {content}
        </h5>
      );
  }
}

// Image Block - Full width for content images, inline for product images with links
function ImageBlock({
  block,
  blogSlug,
}: {
  block: BlogImageBlock;
  blogSlug: string;
}) {
  // Get local image path or fall back to original src
  const imageSrc = block.local_file
    ? getLocalImagePath(block.local_file, blogSlug)
    : block.src;

  // Get filename for product matching
  const filename =
    block.local_file?.filename || block.src.split("/").pop() || "";

  // Check if this is a product image and get its link
  const productLink = getProductLink(block.alt, filename);
  const productTitle = getProductTitle(block.alt, filename);

  // Determine if it's a product/small image or content image
  const isSmallImage =
    block.dimensions.width < 500 && block.dimensions.height < 700;

  // Check if this is one of those nail polish product images or product shots
  const hasProductIndicators =
    block.alt &&
    (block.alt.includes("WHITE ORCHID") ||
      block.alt.includes("GENEVE") ||
      block.alt.includes("IZMIR") ||
      block.alt.includes("LOTUS") ||
      block.alt.includes(".png") ||
      block.alt.includes(".jpg") ||
      block.alt.toLowerCase().includes("mava") ||
      block.alt.toLowerCase().includes("nail") ||
      block.alt.toLowerCase().includes("cream") ||
      block.alt.toLowerCase().includes("serum"));

  const isProductImageBlock =
    (isSmallImage && hasProductIndicators) || productLink;

  // Product image - inline with link
  if (isProductImageBlock) {
    const imageContent = (
      <figure className="my-4 inline-block mr-6 group">
        <div
          className={`relative overflow-hidden rounded-lg ${
            productLink ? "cursor-pointer" : ""
          }`}
        >
          <img
            src={imageSrc}
            alt={block.alt || productTitle || ""}
            className={`h-auto max-h-[350px] w-auto transition-transform duration-300 ${
              productLink ? "group-hover:scale-105" : ""
            }`}
            loading="lazy"
          />
          {/* Product link indicator */}
          {productLink && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-gray-800 text-xs uppercase tracking-wider px-3 py-1.5 rounded-full">
                View Product
              </span>
            </div>
          )}
        </div>
        {/* Caption - show alt text (like "257 WHITE ORCHID") or fallback to product title */}
        {block.alt && !block.alt.includes(".") && (
          <figcaption
            className={`mt-3 text-xs text-center uppercase tracking-wider ${
              productLink ? "text-gray-700 font-medium" : "text-gray-500"
            }`}
          >
            {block.alt}
          </figcaption>
        )}
      </figure>
    );

    // Wrap in link if product link exists
    if (productLink) {
      return (
        <Link to={productLink} className="inline-block">
          {imageContent}
        </Link>
      );
    }

    return imageContent;
  }

  // Full width content image - extends to fill container width
  return (
    <figure className="my-10 -mx-4 md:-mx-12 lg:-mx-20 xl:-mx-32 2xl:-mx-40">
      <img
        src={imageSrc}
        alt={block.alt || ""}
        className="w-full h-auto max-w-none"
        loading="lazy"
      />
      {block.caption && (
        <figcaption className="mt-3 text-sm text-gray-500 italic text-center">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

// List Block
function ListBlock({ block }: { block: BlogListBlock }) {
  const ListTag = block.type === "ordered_list" ? "ol" : "ul";
  const listClass =
    block.type === "ordered_list" ? "list-decimal" : "list-disc";

  return (
    <ListTag
      className={`${listClass} pl-6 mb-6 space-y-2 text-base md:text-lg text-gray-700`}
    >
      {block.items.map((item, idx) => (
        <li key={idx} className="leading-relaxed">
          {item.text}
        </li>
      ))}
    </ListTag>
  );
}

// Helper to format links in HTML
function formatLinks(html: string): string {
  return html.replace(/<a /g, '<a class="text-[#E31837] hover:underline" ');
}

export default function BlogPost() {
  const { blog, relatedPosts } = useLoaderData<typeof loader>();

  // Get primary category/tag
  const primaryTag = blog.metadata.tags[0] || "NEWS";

  return (
    <div className="pt-[104px] md:pt-[112px] min-h-screen bg-white">
      {/* Clean Header - Similar to original Mavala design */}
      <header className="py-10 md:py-16 text-center border-b border-gray-100">
        <div className="container mx-auto px-4">
          {/* Date */}
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-gray-500 mb-4">
            {formatBlogDate(blog.metadata.date).toUpperCase()}
          </p>

          {/* Title - Red uppercase like original */}
          <h1 className="font-marcellus text-2xl md:text-3xl lg:text-4xl text-[#E31837] uppercase tracking-wide mb-4 max-w-5xl mx-auto leading-tight">
            {blog.metadata.title}
          </h1>

          {/* Category */}
          <p className="text-xs md:text-sm uppercase tracking-[0.15em] text-gray-500">
            {primaryTag}
          </p>
        </div>
      </header>

      {/* Article Content - Wide layout for desktop */}
      <article className="py-10 md:py-16 overflow-hidden">
        <div className="mx-auto px-4 md:px-8 lg:px-12 xl:px-16 max-w-[1400px]">
          {/* Content Blocks */}
          <div className="article-content max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
            {blog.content_blocks
              .sort((a, b) => a.order - b.order)
              .map((block, idx) => (
                <ContentBlockRenderer
                  key={idx}
                  block={block as BlogContentBlock}
                  blogSlug={blog.slug}
                />
              ))}
          </div>

          {/* Tags Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200 max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-500">Tagged:</span>
              {blog.metadata.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs uppercase tracking-wider text-[#E31837] bg-[#E31837]/5 px-3 py-1.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation & Share */}
          <div className="mt-8 flex items-center justify-between max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#E31837] transition-colors"
            >
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
                  d="M7 16l-4-4m0 0l4-4m-4 4h18"
                />
              </svg>
              Back to Blog
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Share:</span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  blog.url,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#E31837] transition-colors"
                aria-label="Share on Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                </svg>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  blog.url,
                )}&text=${encodeURIComponent(blog.metadata.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#E31837] transition-colors"
                aria-label="Share on Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z" />
                </svg>
              </a>
              <a
                href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
                  blog.url,
                )}&description=${encodeURIComponent(blog.metadata.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#E31837] transition-colors"
                aria-label="Share on Pinterest"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.14.5C5.86.5 2.7 5 2.7 8.75c0 2.27.86 4.3 2.7 5.05.3.12.57 0 .66-.33l.27-1.06c.1-.32.06-.44-.2-.73-.52-.62-.86-1.44-.86-2.6 0-3.33 2.5-6.32 6.5-6.32 3.55 0 5.5 2.17 5.5 5.07 0 3.8-1.7 7.02-4.2 7.02-1.37 0-2.4-1.14-2.07-2.54.4-1.68 1.16-3.48 1.16-4.7 0-1.07-.58-1.98-1.78-1.98-1.4 0-2.55 1.47-2.55 3.42 0 1.25.43 2.1.43 2.1l-1.7 7.2c-.5 2.13-.08 4.75-.04 5 .02.17.22.2.3.1.14-.18 1.82-2.26 2.4-4.33.16-.58.93-3.63.93-3.63.46.88 1.8 1.65 3.22 1.65 4.25 0 7.13-3.87 7.13-9.05C20.5 4.15 17.18.5 12.14.5z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-marcellus text-2xl md:text-3xl text-gray-900">
                Related Articles
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {relatedPosts.map((post) => (
                <RelatedPostCard key={post.slug} blog={post as BlogPost} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h3 className="font-marcellus text-2xl md:text-3xl text-gray-900 mb-4">
            Shop the Look
          </h3>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Explore our range of Swiss beauty products for your nail care,
            skincare, and beauty routine.
          </p>
          <Link
            to="/all-products"
            className="inline-flex items-center justify-center gap-2 bg-[#E31837] text-white px-8 py-3 text-sm uppercase tracking-wider hover:bg-gray-900 transition-colors"
          >
            Shop Products
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
          </Link>
        </div>
      </section>
    </div>
  );
}

// Related Post Card Component
function RelatedPostCard({ blog }: { blog: BlogPost }) {
  const featuredImage = getFeaturedImage(blog);

  // Title case
  const title = blog.metadata.title
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={featuredImage}
          alt={blog.metadata.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-5">
        <h4 className="font-marcellus text-base text-gray-900 group-hover:text-[#E31837] transition-colors line-clamp-2 mb-2">
          {title}
        </h4>
        <span className="text-xs text-gray-400">
          {formatBlogDate(blog.metadata.date)}
        </span>
      </div>
    </Link>
  );
}
