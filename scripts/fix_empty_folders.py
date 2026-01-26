"""
Fix products with empty folders - re-download and process their images
"""
import json
import requests
from pathlib import Path
from PIL import Image
import numpy as np
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

GREY_RGB = (245, 245, 245)
WHITE_THRESHOLD = 240

EMPTY_FOLDERS = ['mavapen', 'gel-finish-top-coat']

def process_product(product, images_dir):
    """Download and process images for a product"""
    slug = product.get('slug', '')
    title = product.get('title', slug)
    images = product.get('images', [])
    
    print(f"\n📦 Processing: {title}")
    print(f"   Slug: {slug}")
    print(f"   Images: {len(images)}")
    
    if not images:
        print("   ⚠️  No images found")
        return
    
    # Create folder
    images_dir.mkdir(parents=True, exist_ok=True)
    
    processed = 0
    
    # Download each image
    for idx, url in enumerate(images):
        if 'squarespace' in url:
            print(f"\n   📥 Downloading image {idx + 1}/{len(images)}...")
            
            # Remove size constraints
            clean_url = url.split('?')[0]
            
            try:
                response = requests.get(clean_url, timeout=30, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                })
                response.raise_for_status()
                
                # Save temp file
                temp_path = images_dir / f'temp_{idx}.png'
                with open(temp_path, 'wb') as f:
                    f.write(response.content)
                
                print(f"      ✅ Downloaded")
                
                # Process image
                img = Image.open(temp_path).convert('RGB')
                data = np.array(img)
                
                # Find white pixels
                white_mask = (data[:,:,0] > WHITE_THRESHOLD) & \
                             (data[:,:,1] > WHITE_THRESHOLD) & \
                             (data[:,:,2] > WHITE_THRESHOLD)
                
                white_percentage = np.sum(white_mask) / (data.shape[0] * data.shape[1]) * 100
                
                if white_percentage > 5:
                    print(f"      🔍 White pixels: {white_percentage:.1f}%")
                    # Replace white with grey
                    data[white_mask] = GREY_RGB
                    result = Image.fromarray(data)
                else:
                    print(f"      ✓ No white background")
                    result = img
                
                # Save as PNG
                output_path = images_dir / f'{idx:02d}.png'
                result.save(output_path, 'PNG', optimize=True)
                
                print(f"      🎨 Saved: {output_path.name}")
                
                # Remove temp file
                temp_path.unlink()
                processed += 1
                
            except Exception as e:
                print(f"      ❌ Error: {e}")
    
    print(f"\n   ✅ Processed {processed}/{len(images)} images")

def main():
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    json_path = project_root / 'scraped_data' / 'all_products_new.json'
    images_base = project_root / 'mavala-hydrogen' / 'public' / 'images'
    
    print("=" * 80)
    print("FIXING EMPTY FOLDERS")
    print("=" * 80)
    
    # Load product data
    with open(json_path, 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    for folder_name in EMPTY_FOLDERS:
        print(f"\n🔧 Fixing: {folder_name}")
        
        # Find product
        product = next((p for p in products if folder_name in p.get('slug', '')), None)
        
        if not product:
            print(f"   ❌ Product not found in data")
            continue
        
        images_dir = images_base / folder_name
        process_product(product, images_dir)
    
    print("\n" + "=" * 80)
    print("COMPLETE")
    print("=" * 80)

if __name__ == '__main__':
    main()

