"""
Mavala Blog Scraper - Comprehensive Blog Content Extraction
============================================================
This script scrapes Mavala blog pages and extracts:
- Blog metadata (title, date, author, tags, categories)
- Content blocks in exact order (paragraphs, headings, images, lists)
- Downloads all images locally
- Preserves styling information where possible

Usage:
    python scripts/scrape_blogs.py
"""

import asyncio
import json
import os
import re
import hashlib
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse
from typing import List, Dict, Any, Optional

try:
    from playwright.async_api import async_playwright, Page
    import aiohttp
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'playwright', 'aiohttp'])
    from playwright.async_api import async_playwright, Page
    import aiohttp


# Configuration
BASE_URL = "https://mavala.com.au"
OUTPUT_DIR = Path(__file__).parent.parent.parent / "scraped_data" / "blogs_v2"
IMAGES_DIR = OUTPUT_DIR / "images"

# Blog URLs to scrape
BLOG_URLS = [
    "https://mavala.com.au/blog/pantone-color-of-the-year",
    "https://mavala.com.au/blog/your-care-your-style",
    "https://mavala.com.au/blog/power-of-pink",
    "https://mavala.com.au/blog/breaking-up-with-synthetic-nails",
    "https://mavala.com.au/blog/polka-dot-nails",
    "https://mavala.com.au/blog/nail-trends",
    "https://mavala.com.au/blog/beauty-myths",
    "https://mavala.com.au/blog/a-manicure-for-me",
]


def sanitize_filename(name: str) -> str:
    """Convert a string to a safe filename."""
    # Remove special characters and replace spaces with underscores
    name = re.sub(r'[^\w\s-]', '', name)
    name = re.sub(r'[\s]+', '_', name)
    return name.lower()[:100]


def get_slug_from_url(url: str) -> str:
    """Extract slug from blog URL."""
    path = urlparse(url).path
    return path.rstrip('/').split('/')[-1]


async def download_image(session: aiohttp.ClientSession, url: str, blog_slug: str) -> Optional[Dict[str, str]]:
    """Download an image and save it locally."""
    try:
        # Create blog-specific image directory
        blog_images_dir = IMAGES_DIR / blog_slug
        blog_images_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate filename from URL
        parsed = urlparse(url)
        original_filename = os.path.basename(parsed.path)
        
        # Clean up filename
        if not original_filename or original_filename == '':
            # Generate from URL hash
            url_hash = hashlib.md5(url.encode()).hexdigest()[:12]
            original_filename = f"image_{url_hash}.jpg"
        
        # Ensure extension
        if not any(original_filename.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']):
            original_filename += '.jpg'
        
        # Sanitize filename
        safe_filename = sanitize_filename(Path(original_filename).stem) + Path(original_filename).suffix
        local_path = blog_images_dir / safe_filename
        
        # Headers to bypass Squarespace protection
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://mavala.com.au/',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
        }
        
        # Download image
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=30), headers=headers) as response:
            if response.status == 200:
                content = await response.read()
                with open(local_path, 'wb') as f:
                    f.write(content)
                
                return {
                    "original_url": url,
                    "local_path": str(local_path.relative_to(OUTPUT_DIR.parent)),
                    "filename": safe_filename,
                    "size_bytes": len(content)
                }
            else:
                print(f"    Failed to download image: {url} (status: {response.status})")
                return None
    except Exception as e:
        print(f"    Error downloading image {url}: {e}")
        return None


async def extract_content_blocks(page: Page, blog_slug: str, session: aiohttp.ClientSession) -> List[Dict[str, Any]]:
    """
    Extract all content blocks from the blog post body in exact order.
    This preserves the structure: text, image, heading, list, etc.
    """
    content_blocks = []
    
    # Find the main blog content area
    # Mavala uses Squarespace, so we look for the post body
    selectors = [
        '.blog-item-content-wrapper .sqs-layout',
        '.BlogItem-content .sqs-layout',
        '[data-layout-label="Post Body"]',
        '.entry-content',
        'article .sqs-layout'
    ]
    
    main_content = None
    for selector in selectors:
        main_content = await page.query_selector(selector)
        if main_content:
            break
    
    if not main_content:
        print(f"  Warning: Could not find main content area for {blog_slug}")
        # Try to get any content from the page
        main_content = await page.query_selector('main') or await page.query_selector('body')
    
    # Get all direct content elements in order
    # We'll traverse the DOM to maintain exact order
    elements = await main_content.query_selector_all(
        'p, h1, h2, h3, h4, h5, h6, img, ul, ol, blockquote, figure, .image-block-wrapper'
    )
    
    seen_images = set()  # Track images to avoid duplicates
    
    for element in elements:
        tag_name = await element.evaluate('el => el.tagName.toLowerCase()')
        
        try:
            if tag_name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                # Heading
                text = await element.inner_text()
                text = text.strip()
                if text and text not in ['', 'null']:
                    # Get styles
                    styles = await element.evaluate('''el => {
                        const computed = window.getComputedStyle(el);
                        return {
                            fontSize: computed.fontSize,
                            fontWeight: computed.fontWeight,
                            color: computed.color,
                            marginTop: computed.marginTop,
                            marginBottom: computed.marginBottom
                        };
                    }''')
                    
                    content_blocks.append({
                        "type": "heading",
                        "level": int(tag_name[1]),
                        "content": text,
                        "styles": styles,
                        "order": len(content_blocks)
                    })
            
            elif tag_name == 'p':
                # Paragraph
                text = await element.inner_text()
                text = text.strip()
                
                # Skip empty paragraphs or navigation text
                skip_patterns = [
                    'free shipping', 'cart', 'sign in', 'search', 
                    'filter', 'mavala australia', 'back to top',
                    'join our mailing', 'email address', 'join now'
                ]
                if text and len(text) > 3 and not any(p in text.lower() for p in skip_patterns):
                    # Get inner HTML for links and formatting
                    html = await element.inner_html()
                    
                    # Check for bold text
                    has_bold = await element.evaluate('el => el.querySelector("strong, b") !== null')
                    
                    # Get styles
                    styles = await element.evaluate('''el => {
                        const computed = window.getComputedStyle(el);
                        return {
                            fontSize: computed.fontSize,
                            fontWeight: computed.fontWeight,
                            color: computed.color,
                            lineHeight: computed.lineHeight,
                            marginTop: computed.marginTop,
                            marginBottom: computed.marginBottom
                        };
                    }''')
                    
                    # Extract links
                    links = await element.evaluate('''el => {
                        return Array.from(el.querySelectorAll('a')).map(a => ({
                            text: a.innerText,
                            href: a.href,
                            target: a.target
                        }));
                    }''')
                    
                    content_blocks.append({
                        "type": "paragraph",
                        "content": text,
                        "html": html,
                        "has_bold": has_bold,
                        "links": links,
                        "styles": styles,
                        "order": len(content_blocks)
                    })
            
            elif tag_name == 'img' or tag_name == 'figure' or 'image' in tag_name:
                # Image
                img_element = element
                if tag_name == 'figure':
                    img_element = await element.query_selector('img')
                elif 'image-block' in tag_name:
                    img_element = await element.query_selector('img')
                
                if img_element:
                    img_src = await img_element.get_attribute('src') or await img_element.get_attribute('data-src')
                    img_alt = await img_element.get_attribute('alt') or ''
                    
                    if img_src and img_src not in seen_images:
                        seen_images.add(img_src)
                        
                        # Skip small icons and navigation images
                        width = await img_element.evaluate('el => el.naturalWidth || el.width || 0')
                        height = await img_element.evaluate('el => el.naturalHeight || el.height || 0')
                        
                        if width > 50 and height > 50:
                            # Get image dimensions and styles
                            img_styles = await img_element.evaluate('''el => {
                                const computed = window.getComputedStyle(el);
                                return {
                                    width: el.getAttribute('width') || computed.width,
                                    height: el.getAttribute('height') || computed.height,
                                    objectFit: computed.objectFit,
                                    objectPosition: computed.objectPosition,
                                    borderRadius: computed.borderRadius
                                };
                            }''')
                            
                            # Download image
                            downloaded = await download_image(session, img_src, blog_slug)
                            
                            # Check for caption
                            caption = ''
                            if tag_name == 'figure':
                                figcaption = await element.query_selector('figcaption')
                                if figcaption:
                                    caption = await figcaption.inner_text()
                            
                            content_blocks.append({
                                "type": "image",
                                "src": img_src,
                                "alt": img_alt,
                                "caption": caption.strip(),
                                "local_file": downloaded,
                                "dimensions": {"width": width, "height": height},
                                "styles": img_styles,
                                "order": len(content_blocks)
                            })
            
            elif tag_name in ['ul', 'ol']:
                # List
                list_type = "unordered" if tag_name == 'ul' else "ordered"
                items = await element.evaluate('''el => {
                    return Array.from(el.querySelectorAll('li')).map(li => ({
                        text: li.innerText.trim(),
                        html: li.innerHTML
                    }));
                }''')
                
                if items:
                    # Get list styles
                    styles = await element.evaluate('''el => {
                        const computed = window.getComputedStyle(el);
                        return {
                            listStyleType: computed.listStyleType,
                            paddingLeft: computed.paddingLeft,
                            marginTop: computed.marginTop,
                            marginBottom: computed.marginBottom
                        };
                    }''')
                    
                    content_blocks.append({
                        "type": f"{list_type}_list",
                        "items": items,
                        "styles": styles,
                        "order": len(content_blocks)
                    })
            
            elif tag_name == 'blockquote':
                # Blockquote
                text = await element.inner_text()
                html = await element.inner_html()
                
                styles = await element.evaluate('''el => {
                    const computed = window.getComputedStyle(el);
                    return {
                        fontStyle: computed.fontStyle,
                        borderLeft: computed.borderLeft,
                        paddingLeft: computed.paddingLeft,
                        marginLeft: computed.marginLeft
                    };
                }''')
                
                if text.strip():
                    content_blocks.append({
                        "type": "blockquote",
                        "content": text.strip(),
                        "html": html,
                        "styles": styles,
                        "order": len(content_blocks)
                    })
        
        except Exception as e:
            print(f"    Error processing element {tag_name}: {e}")
            continue
    
    return content_blocks


async def extract_metadata(page: Page) -> Dict[str, Any]:
    """Extract blog metadata: title, date, author, tags, categories."""
    metadata = {
        "title": "",
        "date": "",
        "date_iso": "",
        "author": "",
        "categories": [],
        "tags": [],
        "featured_image": "",
        "excerpt": ""
    }
    
    # Extract title
    title_selectors = [
        '.BlogItem-title',
        'h1.entry-title',
        'article h1',
        '.blog-item-title h1',
        'h1'
    ]
    for selector in title_selectors:
        title_el = await page.query_selector(selector)
        if title_el:
            title_text = await title_el.inner_text()
            if title_text and len(title_text) < 200:
                metadata["title"] = title_text.strip()
                break
    
    # Extract date - look for common date patterns
    date_selectors = [
        '.Blog-meta-item--date time',
        'time[datetime]',
        '.blog-item-meta time',
        '.entry-date'
    ]
    for selector in date_selectors:
        date_el = await page.query_selector(selector)
        if date_el:
            date_str = await date_el.inner_text()
            datetime_attr = await date_el.get_attribute('datetime')
            if datetime_attr:
                metadata["date_iso"] = datetime_attr
            if date_str:
                metadata["date"] = date_str.strip()
                break
    
    # Try to extract date from page text if not found
    if not metadata["date"]:
        # Look for date patterns like "December 29, 2025"
        page_text = await page.inner_text('body')
        date_pattern = r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}'
        match = re.search(date_pattern, page_text)
        if match:
            metadata["date"] = match.group(0)
    
    # Extract author
    author_selectors = [
        '.Blog-meta-item--author',
        '.author-name',
        '.blog-item-author',
        '.entry-author'
    ]
    for selector in author_selectors:
        author_el = await page.query_selector(selector)
        if author_el:
            author_text = await author_el.inner_text()
            if author_text:
                metadata["author"] = author_text.strip()
                break
    
    # Default author for Mavala
    if not metadata["author"]:
        metadata["author"] = "Mavala Australia"
    
    # Extract categories/tags
    tag_selectors = [
        '.blog-item-category a',
        '.Blog-meta-item--categories a',
        '.entry-categories a',
        '.tag-cloud a'
    ]
    for selector in tag_selectors:
        tag_els = await page.query_selector_all(selector)
        for tag_el in tag_els:
            tag_text = await tag_el.inner_text()
            if tag_text:
                clean_tag = tag_text.strip()
                if clean_tag and clean_tag not in metadata["categories"]:
                    metadata["categories"].append(clean_tag)
    
    # Look for "Tagged:" section
    tagged_section = await page.evaluate('''() => {
        const text = document.body.innerText;
        const match = text.match(/Tagged:\\s*([^\\n]+)/i);
        return match ? match[1] : '';
    }''')
    if tagged_section:
        tags = [t.strip() for t in tagged_section.split(',') if t.strip()]
        metadata["tags"] = tags
    
    # Extract featured image
    featured_selectors = [
        'meta[property="og:image"]',
        '.blog-item-image img',
        '.BlogItem-image img',
        'article img'
    ]
    for selector in featured_selectors:
        if 'meta' in selector:
            meta_el = await page.query_selector(selector)
            if meta_el:
                content = await meta_el.get_attribute('content')
                if content:
                    metadata["featured_image"] = content
                    break
        else:
            img_el = await page.query_selector(selector)
            if img_el:
                src = await img_el.get_attribute('src') or await img_el.get_attribute('data-src')
                if src:
                    metadata["featured_image"] = src
                    break
    
    # Extract excerpt/description
    excerpt_selectors = [
        'meta[property="og:description"]',
        'meta[name="description"]',
        '.blog-item-excerpt',
        '.entry-summary p'
    ]
    for selector in excerpt_selectors:
        if 'meta' in selector:
            meta_el = await page.query_selector(selector)
            if meta_el:
                content = await meta_el.get_attribute('content')
                if content:
                    metadata["excerpt"] = content
                    break
        else:
            excerpt_el = await page.query_selector(selector)
            if excerpt_el:
                excerpt_text = await excerpt_el.inner_text()
                if excerpt_text:
                    metadata["excerpt"] = excerpt_text.strip()[:500]
                    break
    
    return metadata


async def scrape_blog(page: Page, url: str, session: aiohttp.ClientSession) -> Dict[str, Any]:
    """Scrape a single blog page."""
    slug = get_slug_from_url(url)
    print(f"\nScraping: {slug}")
    print(f"  URL: {url}")
    
    try:
        # Navigate to page
        await page.goto(url, wait_until='networkidle', timeout=60000)
        
        # Wait for content to load
        await page.wait_for_timeout(2000)
        
        # Extract metadata
        print("  Extracting metadata...")
        metadata = await extract_metadata(page)
        
        # Extract content blocks
        print("  Extracting content blocks...")
        content_blocks = await extract_content_blocks(page, slug, session)
        
        # Count images
        image_count = len([b for b in content_blocks if b["type"] == "image"])
        print(f"  Found {len(content_blocks)} content blocks, {image_count} images")
        
        # Download featured image
        featured_image_local = None
        if metadata["featured_image"]:
            print("  Downloading featured image...")
            featured_image_local = await download_image(session, metadata["featured_image"], slug)
        
        # Compile blog data
        blog_data = {
            "url": url,
            "slug": slug,
            "scraped_at": datetime.now().isoformat(),
            "metadata": metadata,
            "featured_image_local": featured_image_local,
            "content_blocks": content_blocks,
            "stats": {
                "total_blocks": len(content_blocks),
                "paragraphs": len([b for b in content_blocks if b["type"] == "paragraph"]),
                "headings": len([b for b in content_blocks if b["type"] == "heading"]),
                "images": image_count,
                "lists": len([b for b in content_blocks if "list" in b["type"]])
            }
        }
        
        return blog_data
    
    except Exception as e:
        print(f"  ERROR scraping {url}: {e}")
        return {
            "url": url,
            "slug": slug,
            "error": str(e),
            "scraped_at": datetime.now().isoformat()
        }


async def scrape_blog_index(page: Page) -> List[str]:
    """Scrape the main blog index to discover all blog URLs."""
    print("\nDiscovering blog URLs from index page...")
    
    await page.goto(f"{BASE_URL}/blog", wait_until='networkidle', timeout=60000)
    await page.wait_for_timeout(2000)
    
    # Find all blog post links
    links = await page.evaluate('''() => {
        const anchors = document.querySelectorAll('a[href*="/blog/"]');
        const urls = new Set();
        anchors.forEach(a => {
            const href = a.href;
            // Filter to actual blog posts (not just /blog)
            if (href.includes('/blog/') && href !== 'https://mavala.com.au/blog' && href !== 'https://mavala.com.au/blog/') {
                urls.add(href);
            }
        });
        return Array.from(urls);
    }''')
    
    print(f"  Found {len(links)} blog post links")
    return links


async def main():
    """Main scraping function."""
    print("=" * 60)
    print("MAVALA BLOG SCRAPER")
    print("=" * 60)
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Target blogs: {len(BLOG_URLS)}")
    
    # Create output directories
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    
    async with async_playwright() as p:
        # Launch browser
        print("\nLaunching browser...")
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await context.new_page()
        
        # Create aiohttp session for image downloads
        async with aiohttp.ClientSession() as session:
            all_blogs = []
            
            # Scrape each blog
            for url in BLOG_URLS:
                blog_data = await scrape_blog(page, url, session)
                all_blogs.append(blog_data)
                
                # Save individual blog JSON
                slug = blog_data["slug"]
                output_file = OUTPUT_DIR / f"{slug}.json"
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(blog_data, f, indent=2, ensure_ascii=False)
                print(f"  Saved: {output_file.name}")
                
                # Small delay between requests
                await asyncio.sleep(1)
            
            # Save combined data
            combined_file = OUTPUT_DIR / "all_blogs_combined.json"
            with open(combined_file, 'w', encoding='utf-8') as f:
                json.dump({
                    "scraped_at": datetime.now().isoformat(),
                    "total_blogs": len(all_blogs),
                    "blogs": all_blogs
                }, f, indent=2, ensure_ascii=False)
            print(f"\nSaved combined data: {combined_file.name}")
            
            # Create summary
            print("\n" + "=" * 60)
            print("SCRAPING COMPLETE")
            print("=" * 60)
            print(f"Total blogs scraped: {len(all_blogs)}")
            total_images = sum(b.get('stats', {}).get('images', 0) for b in all_blogs)
            print(f"Total images downloaded: {total_images}")
            print(f"Output directory: {OUTPUT_DIR}")
        
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
