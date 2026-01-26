"""
Single Product Scraper for Mavala
==================================
Scrapes a single product page and saves data + images.

Usage:
    python scripts/scrape_single_product.py <product_url>
"""

import sys
import os
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright
from urllib.parse import urlparse
import time

def slugify(text):
    """Convert text to URL-friendly slug"""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text

def scrape_product(url):
    """Scrape product data from Mavala product page"""
    
    print(f"\n{'='*60}")
    print(f"Scraping: {url}")
    print(f"{'='*60}\n")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            # Navigate to page
            print("Loading page...")
            page.goto(url, wait_until='networkidle', timeout=60000)
            page.wait_for_timeout(3000)
            
            # Extract product data
            product_data = {
                "url": url,
                "slug": "",
                "title": "",
                "price": "",
                "tagline": "",
                "main_description": "",
                "key_ingredients": "",
                "how_to_use": "",
                "images": [],
                "categories": []
            }
            
            # Title
            title_elem = page.query_selector('h1.product-title, h1[class*="title"], .product-name h1')
            if title_elem:
                product_data['title'] = title_elem.inner_text().strip()
                product_data['slug'] = slugify(product_data['title'])
                print(f"Title: {product_data['title']}")
            
            # Price
            price_elem = page.query_selector('.product-price, [class*="price"], .price-item')
            if price_elem:
                product_data['price'] = price_elem.inner_text().strip()
                print(f"Price: {product_data['price']}")
            
            # Tagline/Short Description
            tagline_elem = page.query_selector('.product-subtitle, .short-description, [class*="subtitle"]')
            if tagline_elem:
                product_data['tagline'] = tagline_elem.inner_text().strip()
            
            # Main Description
            desc_elem = page.query_selector('.product-description, [class*="description"], .rte')
            if desc_elem:
                product_data['main_description'] = desc_elem.inner_text().strip()
                print(f"Description: {len(product_data['main_description'])} chars")
            
            # Images - Try multiple selectors
            image_selectors = [
                '.product-gallery img',
                '.product-images img',
                '.product-media img',
                '[class*="gallery"] img',
                '.main-image img'
            ]
            
            images_found = []
            for selector in image_selectors:
                images = page.query_selector_all(selector)
                for img in images:
                    src = img.get_attribute('src') or img.get_attribute('data-src')
                    if src and src.startswith('http'):
                        # Get high-res version
                        if '?' in src:
                            src = src.split('?')[0]
                        if src not in images_found:
                            images_found.append(src)
            
            product_data['images'] = images_found[:5]  # Limit to 5 images
            print(f"Images: {len(product_data['images'])} found")
            
            # Try to get additional sections
            sections = page.query_selector_all('.product-info section, .accordion-item, [class*="tab"]')
            for section in sections:
                heading = section.query_selector('h2, h3, .heading, .title')
                if heading:
                    heading_text = heading.inner_text().strip().lower()
                    content = section.inner_text().strip()
                    
                    if 'ingredient' in heading_text:
                        product_data['key_ingredients'] = content
                    elif 'how to' in heading_text or 'use' in heading_text:
                        product_data['how_to_use'] = content
            
            return product_data
            
        except Exception as e:
            print(f"Error scraping: {e}")
            return None
        finally:
            browser.close()

def download_images(product_data, output_dir):
    """Download product images"""
    
    slug = product_data['slug']
    images_dir = Path(output_dir) / 'images' / slug
    images_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\nDownloading images to: {images_dir}")
    
    import requests
    
    local_images = []
    for i, img_url in enumerate(product_data['images'], 1):
        try:
            print(f"  [{i}/{len(product_data['images'])}] Downloading...")
            response = requests.get(img_url, timeout=30)
            response.raise_for_status()
            
            # Determine extension
            ext = '.jpg'
            if 'png' in img_url.lower():
                ext = '.png'
            elif 'webp' in img_url.lower():
                ext = '.webp'
            
            filename = f"{i:02d}_{slug}{ext}"
            filepath = images_dir / filename
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            local_images.append(str(filepath.relative_to(output_dir)))
            print(f"  [OK] {filename}")
            
        except Exception as e:
            print(f"  [ERROR] Failed to download image {i}: {e}")
    
    product_data['local_images'] = local_images
    return product_data

def save_product(product_data, output_dir):
    """Save product data to JSON"""
    
    slug = product_data['slug']
    json_path = Path(output_dir) / 'products_full' / f"{slug}.json"
    json_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(product_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nProduct data saved to: {json_path}")
    
    # Also append to all_products_new.json
    all_products_path = Path(output_dir) / 'all_products_new.json'
    if all_products_path.exists():
        with open(all_products_path, 'r', encoding='utf-8') as f:
            all_products = json.load(f)
        
        # Check if product already exists
        existing = next((p for p in all_products if p['slug'] == slug), None)
        if existing:
            print(f"Product '{slug}' already exists in all_products_new.json - updating")
            all_products = [p for p in all_products if p['slug'] != slug]
        
        all_products.append(product_data)
        
        with open(all_products_path, 'w', encoding='utf-8') as f:
            json.dump(all_products, f, indent=2, ensure_ascii=False)
        
        print(f"Added to all_products_new.json")

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/scrape_single_product.py <product_url>")
        print("Example: python scripts/scrape_single_product.py https://www.mavala.com/products/mavamed")
        sys.exit(1)
    
    url = sys.argv[1]
    output_dir = Path('scraped_data')
    
    # Scrape product
    product_data = scrape_product(url)
    
    if not product_data or not product_data['title']:
        print("\nFailed to scrape product data")
        sys.exit(1)
    
    # Download images
    product_data = download_images(product_data, output_dir)
    
    # Save data
    save_product(product_data, output_dir)
    
    print(f"\n{'='*60}")
    print("Complete!")
    print(f"{'='*60}")
    print(f"\nProduct: {product_data['title']}")
    print(f"Slug: {product_data['slug']}")
    print(f"Images: {len(product_data['local_images'])}")
    print(f"\nNext steps:")
    print(f"1. Copy images from scraped_data/images/{product_data['slug']}/ to mavala-hydrogen/public/images/")
    print(f"2. Process images with grey background if needed")
    print(f"3. Restart dev server to see the new product")

if __name__ == "__main__":
    main()

