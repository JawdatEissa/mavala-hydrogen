import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { getBlogBySlug, getRecentBlogPosts, type ContentBlock } from '../lib/mock-data';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { handle } = params;
  
  if (!handle) {
    throw new Response('Not Found', { status: 404 });
  }
  
  const post = getBlogBySlug(handle);
  
  if (!post) {
    throw new Response('Not Found', { status: 404 });
  }
  
  const relatedPosts = getRecentBlogPosts(3).filter((p) => p.slug !== post.slug);
  
  return json({ post, relatedPosts });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const excerpt = data?.post.content_blocks
    .find((b: ContentBlock) => b.type === 'paragraph')
    ?.content?.slice(0, 160) || '';
    
  return [
    { title: `${data?.post.title} | Mavala Switzerland` },
    { name: 'description', content: excerpt },
  ];
};

export default function BlogPostPage() {
  const { post, relatedPosts } = useLoaderData<typeof loader>();
  
  // Get featured image
  const featuredImage = post.content_blocks.find((b: ContentBlock) => b.type === 'image')?.src;

  return (
    <div className="pt-[104px] md:pt-[112px]">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-mavala-gray">
            <Link to="/" className="hover:text-mavala-red">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-mavala-red">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-mavala-dark">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Article */}
      <article className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="text-center mb-8">
            {post.categories.length > 0 && (
              <div className="flex gap-2 justify-center mb-4">
                {post.categories.map((cat) => (
                  <span
                    key={cat}
                    className="text-xs uppercase tracking-wider text-mavala-red"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
            
            <h1 className="text-3xl md:text-4xl font-display font-light tracking-wide mb-4">
              {post.title}
            </h1>
            
            {post.date && (
              <p className="text-mavala-gray text-sm">{post.date}</p>
            )}
          </header>

          {/* Featured Image */}
          {featuredImage && (
            <div className="aspect-[16/9] mb-8 overflow-hidden">
              <img
                src={featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {post.content_blocks.map((block: ContentBlock, idx: number) => (
              <ContentBlockRenderer key={idx} block={block} />
            ))}
          </div>

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-mavala-gray">Share this post:</span>
              <div className="flex gap-2">
                {['facebook', 'twitter', 'pinterest', 'email'].map((platform) => (
                  <button
                    key={platform}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-mavala-red hover:text-mavala-red transition-colors"
                    aria-label={`Share on ${platform}`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="section-title">Related Posts</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((p) => (
                <Link key={p.slug} to={`/blog/${p.slug}`} className="group">
                  <div className="aspect-[4/3] bg-gray-100 mb-4 overflow-hidden">
                    {p.content_blocks.find((b: ContentBlock) => b.type === 'image')?.src && (
                      <img
                        src={p.content_blocks.find((b: ContentBlock) => b.type === 'image')?.src}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <h3 className="font-display text-lg group-hover:text-mavala-red transition-colors">
                    {p.title}
                  </h3>
                  {p.date && (
                    <p className="text-sm text-mavala-gray mt-1">{p.date}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'heading':
      const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
      return <HeadingTag className="font-display">{block.content}</HeadingTag>;
      
    case 'paragraph':
      return <p>{block.content}</p>;
      
    case 'bold_text':
      return <p><strong>{block.content}</strong></p>;
      
    case 'image':
      return (
        <figure className="my-8">
          <img
            src={block.src}
            alt={block.alt || ''}
            className="w-full"
          />
          {block.alt && (
            <figcaption className="text-center text-sm text-mavala-gray mt-2">
              {block.alt}
            </figcaption>
          )}
        </figure>
      );
      
    default:
      return null;
  }
}

