"""
Mavala scraper using direct URL parameters
Based on confirmed working URL structure
"""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright
import aiohttp
import pandas as pd
from datetime import datetime

class MavalaURLScraper:
    def __init__(self, input_csv: str, output_dir: str = "scraped_mavala_data"):
        self.input_csv = input_csv
        self.output_dir = Path(output_dir)
        self.images_dir = self.output_dir / "product_images"
        
        self.output_dir.mkdir(exist_ok=True)
        self.images_dir.mkdir(exist_ok=True)
        
        self.results = []
        self.download_images_flag = True
    
    def construct_url(self, main_color: str, shade_number: str, shade_name: str) -> str:
        """
        Construct product URL with query parameter
        Format: https://www.mavala.com/products/mini-color-{color}?Teinte={number}.+{name}
        """
        # Color mapping for URL slugs
        color_map = {
            'Black': 'black',
            'Blue': 'blue',
            'Brown': 'brown',
            'Gold': 'gold',
            'Green': 'green',
            'Grey': 'grey',
            'Nude': 'nude',
            'Orange': 'orange',
            'Pink': 'pink',
            'Purple': 'purple',
            'Red': 'red',
            'Silver': 'silver',
            'Transparent': 'transparent',
            'White': 'white',
            'Yellow': 'yellow'
        }
        
        color_slug = color_map.get(main_color, main_color.lower())
        shade_name_formatted = shade_name.replace(" ", "+")
        
        url = f"https://www.mavala.com/products/mini-color-{color_slug}?Teinte={shade_number}.+{shade_name_formatted}"
        return url
    
    async def scrape_shade(self, page, main_color: str, shade_number: str, shade_name: str, product_slug: str) -> dict:
        """Scrape a single shade using direct URL"""
        
        url = self.construct_url(main_color, shade_number, shade_name)
        print(f"[{shade_number} {shade_name}]", end=" ", flush=True)
        
        try:
            # Go to product URL with Teinte parameter
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await asyncio.sleep(2)
            
            # Get first 3 product images (before "You may also like")
            image_urls = []
            images = await page.query_selector_all('img[src*="cdn.shopify.com/s/files"]')
            
            for img in images[:3]:  # Only first 3
                src = await img.get_attribute('src')
                if src and not 'axeptio' in src.lower():
                    # Remove size params to get original
                    clean_url = src.split('?')[0]
                    if any(ext in clean_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                        if clean_url not in image_urls:
                            image_urls.append(clean_url)
            
            print(f"({len(image_urls)} imgs)")
            
            return {
                "main_color": main_color,
                "shade_number": shade_number,
                "shade_name": shade_name,
                "product_slug": product_slug,
                "url": url,
                "image_urls": image_urls,
                "scraped_at": datetime.now().isoformat(),
                "status": "success" if image_urls else "no_images"
            }
            
        except Exception as e:
            print(f"(ERROR: {e})")
            return {
                "main_color": main_color,
                "shade_number": shade_number,
                "shade_name": shade_name,
                "product_slug": product_slug,
                "url": url,
                "image_urls": [],
                "scraped_at": datetime.now().isoformat(),
                "status": f"error: {str(e)}"
            }
    
    async def download_image(self, session: aiohttp.ClientSession, url: str, shade_number: str, shade_name: str, index: int):
        """Download image to shade folder"""
        try:
            folder_name = f"{shade_number} {shade_name}"
            shade_folder = self.images_dir / folder_name
            shade_folder.mkdir(exist_ok=True)
            
            ext = url.split('.')[-1].lower()
            if ext not in ['jpg', 'jpeg', 'png', 'webp']:
                ext = 'jpg'
            
            filename = f"{index:02d}.{ext}"
            filepath = shade_folder / filename
            
            if filepath.exists():
                return True
            
            async with session.get(url, timeout=30) as response:
                if response.status == 200:
                    content = await response.read()
                    with open(filepath, 'wb') as f:
                        f.write(content)
                    return True
            return False
        except:
            return False
    
    async def download_all_images(self):
        """Download images for all scraped products"""
        if not self.download_images_flag:
            return
        
        print("\nDownloading images...")
        async with aiohttp.ClientSession() as session:
            for product in self.results:
                if product['image_urls']:
                    print(f"  [{product['shade_number']} {product['shade_name']}]: ", end="", flush=True)
                    downloaded = 0
                    for idx, url in enumerate(product['image_urls'], 1):
                        if await self.download_image(session, url, product['shade_number'], product['shade_name'], idx):
                            downloaded += 1
                        await asyncio.sleep(0.3)
                    print(f"{downloaded} imgs")
    
    async def run(self, start_index: int = 0, max_items: int = None):
        """Run the scraper"""
        df = pd.read_csv(self.input_csv)
        
        required_cols = ['Main Color', 'Shade Number', 'Shade Name', 'Product Slug']
        if not all(col in df.columns for col in required_cols):
            raise ValueError(f"CSV must contain: {required_cols}")
        
        if max_items:
            df = df.iloc[start_index:start_index + max_items]
        else:
            df = df.iloc[start_index:]
        
        print(f"Scraping {len(df)} shades starting from index {start_index}\n")
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            )
            page = await context.new_page()
            
            for idx, row in df.iterrows():
                main_color = str(row['Main Color']).strip()
                shade_number = str(row['Shade Number']).strip()
                shade_name = str(row['Shade Name']).strip()
                product_slug = str(row['Product Slug']).strip()
                
                result = await self.scrape_shade(page, main_color, shade_number, shade_name, product_slug)
                self.results.append(result)
                
                await asyncio.sleep(2)
                
                if len(self.results) % 10 == 0:
                    self.save_results()
                    print(f"\nProgress saved: {len(self.results)}/{len(df)}\n")
            
            await browser.close()
        
        self.save_results()
        
        if self.download_images_flag:
            await self.download_all_images()
        
        successful = sum(1 for r in self.results if r['status'] == 'success')
        print(f"\n{'='*60}")
        print(f"Complete: {successful}/{len(self.results)} successful")
        print(f"Output: {self.output_dir}/product_details.json")
        print(f"Images: {self.images_dir}/")
        print(f"{'='*60}\n")
    
    def save_results(self):
        """Save to JSON"""
        output_file = self.output_dir / "product_details.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)

async def main():
    scraper = MavalaURLScraper(
        input_csv="mavala_products_for_scraping.csv",
        output_dir="scraped_mavala_data"
    )
    
    # Test with first 5 shades
    # await scraper.run(start_index=0, max_items=5)
    
    # Or run all 243 shades
    await scraper.run()

if __name__ == "__main__":
    asyncio.run(main())

