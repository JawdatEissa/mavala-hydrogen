"""
Scraper for Mini Bio Color nail polish shades from mavala.com
Downloads up to 3 images per shade into separate folders
"""
import asyncio
import os
import re
import sys
import aiohttp
from pathlib import Path
from urllib.parse import unquote

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# URLs to scrape
BIO_COLOR_URLS = [
    # Pink shades
    ("https://www.mavala.com/products/mini-bio-color-pink?Color=701.+Rio+Grande", "701 RIO GRANDE"),
    ("https://www.mavala.com/products/mini-bio-color-pink?Color=702.+Mississippi", "702 MISSISSIPPI"),
    ("https://www.mavala.com/products/mini-bio-color-pink?Color=704.+Rh%C3%B4ne", "704 RHONE"),
    ("https://www.mavala.com/products/mini-bio-color-pink?Color=706.+Thames", "706 THAMES"),
    ("https://www.mavala.com/products/mini-bio-color-pink?Color=709.+Amazonas", "709 AMAZONAS"),
    ("https://www.mavala.com/products/mini-bio-color-pink?Color=710.+Mekong", "710 MEKONG"),
    ("https://www.mavala.com/products/mini-bio-color-pink?Color=711.+Shannon", "711 SHANNON"),
    ("https://www.mavala.com/products/mini-bio-color-pink?Color=712.+Indus", "712 INDUS"),
    # Red shades
    ("https://www.mavala.com/products/mini-bio-color-red?Color=707.+Colorado", "707 COLORADO"),
    ("https://www.mavala.com/products/mini-bio-color-red?Color=708.+Murray", "708 MURRAY"),
    ("https://www.mavala.com/products/mini-bio-color-red?Color=703.+Nile", "703 NILE"),
    ("https://www.mavala.com/products/mini-bio-color-red?Color=705.+Volta", "705 VOLTA"),
]

def get_high_res_url(url):
    """Convert thumbnail URL to high-res version"""
    # Remove width/height constraints or make them larger
    url = re.sub(r'&width=\d+', '&width=1000', url)
    url = re.sub(r'&height=\d+', '&height=1000', url)
    url = re.sub(r'&crop=center', '', url)
    return url

async def download_image(session, url, filepath):
    """Download an image from URL to filepath"""
    try:
        high_res_url = get_high_res_url(url)
        
        async with session.get(high_res_url) as response:
            if response.status == 200:
                content = await response.read()
                with open(filepath, 'wb') as f:
                    f.write(content)
                return True
            else:
                print(f"      HTTP {response.status} for {high_res_url[:80]}...")
    except Exception as e:
        print(f"      Error: {e}")
    return False

async def scrape_shade(url, shade_name, output_dir):
    """Scrape images for a single shade"""
    try:
        from playwright.async_api import async_playwright
        
        shade_number = shade_name.split()[0]
        
        print(f"\n[SCRAPING] {shade_name}")
        print(f"   URL: {url}")
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            await page.goto(url, wait_until='networkidle', timeout=30000)
            await asyncio.sleep(3)
            
            # Get all images
            images = await page.query_selector_all('img')
            
            # Collect all Shopify CDN images
            all_cdn_images = []
            for img in images:
                src = await img.get_attribute('src')
                if src and 'cdn.shopify.com' in src:
                    all_cdn_images.append(src)
            
            print(f"   Total CDN images: {len(all_cdn_images)}")
            
            # Find the relevant images for this shade
            # Pattern: look for the shade number in the URL
            shade_images = []
            
            for src in all_cdn_images:
                src_lower = src.lower()
                # Skip tracking images
                if 'axeptio' in src_lower:
                    continue
                
                # Match by shade number (e.g., "701" in "701_Rio_Grande" or "967.01-rio-grande")
                # Also match Bio-Color bottle images
                if any([
                    f'_{shade_number}_' in src,
                    f'/{shade_number}_' in src,
                    f'-{shade_number}_' in src,
                    f'_{shade_number}-' in src,
                    f'.{shade_number.zfill(2)}-' in src.lower(),  # 967.01-rio-grande
                    f'bio-color_{shade_number}' in src_lower,
                    f'bio-color-{shade_number}' in src_lower,
                ]):
                    if src not in shade_images:
                        shade_images.append(src)
            
            await browser.close()
            
            # Limit to first 3 images
            shade_images = shade_images[:3]
            print(f"   Found {len(shade_images)} matching images")
            
            if shade_images:
                # Create folder for this shade
                shade_folder = output_dir / shade_name
                shade_folder.mkdir(parents=True, exist_ok=True)
                
                # Download images
                async with aiohttp.ClientSession() as session:
                    for idx, img_url in enumerate(shade_images, 1):
                        ext = 'png' if '.png' in img_url.lower() else 'jpg'
                        filepath = shade_folder / f"{idx:02d}.{ext}"
                        
                        success = await download_image(session, img_url, filepath)
                        if success:
                            print(f"   [OK] {filepath.name}")
                        else:
                            print(f"   [FAIL] {filepath.name}")
                
                return shade_name, len(shade_images)
            
            return shade_name, 0
            
    except Exception as e:
        print(f"   Error: {e}")
        import traceback
        traceback.print_exc()
        return shade_name, 0

async def main():
    # Output directory
    output_dir = Path(__file__).parent.parent / 'scraped_bio_colors'
    output_dir.mkdir(exist_ok=True)
    
    print("=" * 60)
    print("Mini Bio Color Scraper")
    print(f"Output: {output_dir}")
    print(f"URLs to scrape: {len(BIO_COLOR_URLS)}")
    print("=" * 60)
    
    results = []
    for url, shade_name in BIO_COLOR_URLS:
        result = await scrape_shade(url, shade_name, output_dir)
        results.append(result)
        await asyncio.sleep(1)
    
    print("\n" + "=" * 60)
    print("SCRAPING COMPLETE")
    print("=" * 60)
    
    successful = [r for r in results if r[1] > 0]
    print(f"Successfully scraped: {len(successful)}/{len(BIO_COLOR_URLS)} shades")
    
    for shade, count in results:
        status = "[OK]" if count > 0 else "[FAIL]"
        print(f"  {status} {shade}: {count} images")
    
    print(f"\nImages saved to: {output_dir}")

if __name__ == '__main__':
    asyncio.run(main())
