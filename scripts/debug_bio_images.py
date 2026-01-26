"""
Debug script to see what images are on the Bio Color pages
"""
import asyncio
import sys
from urllib.parse import unquote

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

async def debug_page():
    from playwright.async_api import async_playwright
    
    url = "https://www.mavala.com/products/mini-bio-color-pink?Color=701.+Rio+Grande"
    
    print(f"Debugging: {url}")
    print("=" * 80)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        await page.goto(url, wait_until='networkidle', timeout=30000)
        await asyncio.sleep(3)
        
        # Get all images
        images = await page.query_selector_all('img')
        
        print(f"\nFound {len(images)} total images")
        print("-" * 80)
        
        for i, img in enumerate(images):
            src = await img.get_attribute('src')
            if src and 'cdn.shopify.com' in src:
                print(f"\n[{i}] {src[:150]}...")
        
        await browser.close()

if __name__ == '__main__':
    asyncio.run(debug_page())

