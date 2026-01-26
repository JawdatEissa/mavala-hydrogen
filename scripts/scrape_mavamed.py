"""
Scraper for Mavala.com product pages (specifically mavamed)
"""

import os
import json
import requests
from pathlib import Path
from playwright.sync_api import sync_playwright

def scrape_mavamed():
    url = "https://www.mavala.com/products/mavamed"
    
    print(f"\n{'='*60}")
    print(f"Scraping: {url}")
    print(f"{'='*60}\n")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = context.new_page()
        
        try:
            # Navigate with longer timeout
            print("Loading page...")
            page.goto(url, wait_until='networkidle', timeout=60000)
            page.wait_for_timeout(5000)  # Wait for JS to load
            
            # Scroll to load lazy content
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(2000)
            page.evaluate("window.scrollTo(0, 0)")
            page.wait_for_timeout(2000)
            
            # Get page HTML for debugging
            html = page.content()
            with open("mavamed_debug.html", "w", encoding="utf-8") as f:
                f.write(html)
            print("Saved debug HTML")
            
            # Screenshot for reference
            page.screenshot(path="mavamed_debug.png", full_page=True)
            print("Saved debug screenshot")
            
            product_data = {
                "url": url,
                "slug": "mava-med",
                "title": "MAVA-MED",
                "price": "",
                "price_from": "",
                "tagline": "Solution for mycosis-infected nails",
                "main_description": "Tackle fungal nail infections effectively with MAVAMed, a powerful solution with an \"Instant Killer\" complex that stops fungi from spreading and aids nail healing. Enriched with lavender and eucalyptus essential oils, lactic acid and urea, it creates an environment that deters fungal growth while nourishing the nail plate.",
                "key_ingredients": "",
                "how_to_use": "",
                "safety_directions": "",
                "note": "",
                "first_aid": "",
                "sizes": ["5ml"],
                "images": [],
                "categories": ["Nail Care"],
                "local_images": []
            }
            
            # Try to get title
            try:
                title = page.locator('h1').first.inner_text(timeout=5000)
                product_data['title'] = title.upper()
                print(f"Title: {title}")
            except:
                print("Using default title")
            
            # Try to get description
            try:
                # Look for description in various places
                desc_selectors = [
                    '.product-description p',
                    '.product__description p',
                    '[class*="description"] p',
                    '.rte p',
                    'main p'
                ]
                for selector in desc_selectors:
                    try:
                        desc = page.locator(selector).first.inner_text(timeout=2000)
                        if len(desc) > 50:  # Must be substantial
                            product_data['main_description'] = desc
                            print(f"Description: {len(desc)} chars")
                            break
                    except:
                        continue
            except:
                print("Using default description")
            
            # Get ALL images from the page
            print("\nSearching for images...")
            all_imgs = page.query_selector_all('img')
            print(f"Found {len(all_imgs)} total img elements")
            
            images_found = []
            for img in all_imgs:
                src = img.get_attribute('src') or ''
                srcset = img.get_attribute('srcset') or ''
                data_src = img.get_attribute('data-src') or ''
                alt = img.get_attribute('alt') or ''
                
                # Check all sources
                for source in [src, data_src]:
                    if source and 'cdn.shopify.com' in source:
                        # Get high-res version
                        base_url = source.split('?')[0]
                        if base_url not in images_found:
                            images_found.append(base_url)
                            print(f"  Found: {base_url[:80]}...")
                
                # Check srcset for higher resolution
                if srcset:
                    for part in srcset.split(','):
                        url_part = part.strip().split(' ')[0]
                        if 'cdn.shopify.com' in url_part:
                            base_url = url_part.split('?')[0]
                            if base_url not in images_found:
                                images_found.append(base_url)
            
            # Filter to product images only (exclude icons, logos, etc)
            product_images = []
            for img_url in images_found:
                lower_url = img_url.lower()
                # Skip common non-product images
                if any(x in lower_url for x in ['logo', 'icon', 'badge', 'social', 'banner', 'flag']):
                    continue
                # Keep likely product images
                if 'product' in lower_url or 'mava' in lower_url or 'files' in lower_url:
                    product_images.append(img_url)
            
            print(f"\nFiltered to {len(product_images)} product images")
            product_data['images'] = product_images[:5]
            
            # Try to expand accordion sections and get content
            try:
                accordions = page.locator('[class*="accordion"], details, [data-accordion]').all()
                print(f"\nFound {len(accordions)} accordion sections")
                for acc in accordions:
                    try:
                        acc.click()
                        page.wait_for_timeout(500)
                    except:
                        pass
                
                # Now try to get accordion content
                page.wait_for_timeout(1000)
                
                # Get How to Use
                try:
                    how_to = page.locator('text=How to Use').locator('..').locator('..').inner_text(timeout=2000)
                    product_data['how_to_use'] = how_to.replace('How to Use', '').strip()
                except:
                    pass
                
                # Get Active Ingredients
                try:
                    ingredients = page.locator('text=Active Ingredients').locator('..').locator('..').inner_text(timeout=2000)
                    product_data['key_ingredients'] = ingredients.replace('Active Ingredients', '').strip()
                except:
                    pass
                    
            except Exception as e:
                print(f"Accordion error: {e}")
            
            return product_data
            
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
            return None
        finally:
            browser.close()

def download_images(product_data):
    """Download product images"""
    
    slug = product_data['slug']
    output_dir = Path('mavala-hydrogen/public/images') / slug
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\nDownloading images to: {output_dir}")
    
    local_images = []
    for i, img_url in enumerate(product_data['images'], 1):
        try:
            print(f"  [{i}/{len(product_data['images'])}] Downloading: {img_url[:60]}...")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(img_url, headers=headers, timeout=30)
            response.raise_for_status()
            
            # Determine extension
            ext = '.png'
            if '.jpg' in img_url.lower() or '.jpeg' in img_url.lower():
                ext = '.jpg'
            
            filename = f"{i:02d}_{slug}{ext}"
            filepath = output_dir / filename
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            local_images.append(f"images/{slug}/{filename}")
            print(f"  [OK] {filename} ({len(response.content)//1024}KB)")
            
        except Exception as e:
            print(f"  [ERROR] {e}")
    
    product_data['local_images'] = local_images
    return product_data

def save_product(product_data):
    """Save product to JSON files"""
    
    slug = product_data['slug']
    
    # Save individual product file
    json_path = Path('scraped_data/products_full') / f"{slug}.json"
    json_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(product_data, f, indent=2, ensure_ascii=False)
    print(f"\nSaved to: {json_path}")
    
    # Update all_products_new.json
    all_products_path = Path('scraped_data/all_products_new.json')
    if all_products_path.exists():
        with open(all_products_path, 'r', encoding='utf-8') as f:
            all_products = json.load(f)
        
        # Remove existing entry if present
        all_products = [p for p in all_products if p.get('slug') != slug]
        all_products.append(product_data)
        
        with open(all_products_path, 'w', encoding='utf-8') as f:
            json.dump(all_products, f, indent=2, ensure_ascii=False)
        print(f"Updated all_products_new.json")

def main():
    # Scrape the product
    product_data = scrape_mavamed()
    
    if not product_data:
        print("Failed to scrape product")
        return
    
    # Download images
    if product_data['images']:
        product_data = download_images(product_data)
    else:
        print("\nNo images found to download")
    
    # Save product data
    save_product(product_data)
    
    print(f"\n{'='*60}")
    print("COMPLETE!")
    print(f"{'='*60}")
    print(f"\nProduct: {product_data['title']}")
    print(f"Slug: {product_data['slug']}")
    print(f"Description: {len(product_data['main_description'])} chars")
    print(f"Images downloaded: {len(product_data.get('local_images', []))}")
    print(f"\nView at: http://localhost:5173/products/{product_data['slug']}")

if __name__ == "__main__":
    main()

