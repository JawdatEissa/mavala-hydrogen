"""
Process Nail Care Product Images
=================================
This script identifies nail-care products with squarespace URLs,
downloads them, replaces white backgrounds with grey, and saves them locally.

INSTALLATION:
-------------
pip install Pillow requests numpy

USAGE:
------
python scripts/process_nail_care_images.py
"""

import json
import requests
import sys
from pathlib import Path
from PIL import Image
import numpy as np
from urllib.parse import urlparse, unquote
import time

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Nail care product slugs from nail-care.tsx
NAIL_CARE_SLUGS = [
    # PENETRATING CARE
    "mavala-scientifique-k",
    "mavala-scientifique",
    "nailactan",
    "mava-flex",
    "mavaderma",
    # CUTICLE CARE
    "mavapen",
    "lightening-scrub-mask",
    "cuticle-remover",
    "cuticle-cream",
    "cuticle-oil",
    "cuticle-care-kit",
    # NAIL CAMOUFLAGE
    "nail-shield",
    "ridge-filler",
    "mava-white",
    "mavala-stop",
    "mavala-stop-pen",
    "post-artificial-nails-kit",
    # NAIL BEAUTY
    "mava-strong",
    "mavala-002-protective-base-coat",
    "barrier-base-coat",
    "colorfix",
    "gel-finish-top-coat",
    "star-top-coat",
    "oil-seal-dryer",
    "mavadry",
    "mavadry-spray",
    "perfect-manicure-kit",
    # MANICURE INSTRUMENTS
    "mini-emery-boards",
    "emery-boards",
    "manicure-sticks",
    "nail-white-crayon",
    "hoofstick",
    "nail-buffer-kit",
    "manicure-bowl",
    "manicure-pill",
    "nail-brush",
    "french-manicure-stickers",
    "pedi-pads",
    "scissors",
    "straight-cuticle-scissors",
    "baby-nail-scissors",
    "cuticle-nippers",
    "nail-nippers",
    "toenail-nippers",
    "clippers",
    "professional-manicure-tray",
    # NAIL POLISH REMOVERS
    "blue-nail-polish-remover",
    "pink-nail-polish-remover",
    "crystal-nail-polish-remover",
    "correcteur-pen",
    "nail-polish-remover-pads",
    "make-up-remover-cotton-pads",
]

# Target grey color
GREY_RGB = (245, 245, 245)  # #f5f5f5
WHITE_THRESHOLD = 240

def is_squarespace_url(url):
    """Check if URL is from squarespace CDN"""
    if not url:
        return False
    return 'squarespace-cdn.com' in url or 'squarespace.com' in url

def get_filename_from_url(url, index=0):
    """Extract a clean filename from URL"""
    try:
        parsed = urlparse(url)
        path = unquote(parsed.path)
        filename = Path(path).name
        
        # Remove query parameters
        filename = filename.split('?')[0]
        
        # If filename is too complex or contains UUID-like strings, simplify
        if len(filename) > 50 or '-' * 5 in filename:
            # Use index-based naming
            ext = Path(filename).suffix or '.jpg'
            filename = f"{index:02d}{ext}"
        
        return filename
    except:
        return f"{index:02d}.jpg"

def download_image(url, save_path):
    """Download image from URL"""
    try:
        print(f"   📥 Downloading: {url[:80]}...")
        
        # Remove size constraints from squarespace URLs
        if 'squarespace-cdn.com' in url:
            # Remove format parameter to get original quality
            url = url.split('?')[0]
        
        response = requests.get(url, timeout=30, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        response.raise_for_status()
        
        with open(save_path, 'wb') as f:
            f.write(response.content)
        
        print(f"   ✅ Downloaded: {save_path.name}")
        return True
        
    except Exception as e:
        print(f"   ❌ Download failed: {e}")
        return False

def has_white_background(img_path):
    """Check if image has significant white background"""
    try:
        img = Image.open(img_path).convert('RGB')
        data = np.array(img)
        
        # Count white pixels
        white_mask = (data[:,:,0] > WHITE_THRESHOLD) & \
                     (data[:,:,1] > WHITE_THRESHOLD) & \
                     (data[:,:,2] > WHITE_THRESHOLD)
        
        white_percentage = np.sum(white_mask) / (data.shape[0] * data.shape[1]) * 100
        
        # If more than 5% of image is white, it likely has a white background
        return white_percentage > 5
    except:
        return False

def replace_white_with_grey(img_path):
    """Replace white/near-white pixels with grey and save as PNG"""
    try:
        img = Image.open(img_path)
        
        # Convert to RGB if necessary
        if img.mode == 'RGBA':
            # For RGBA, only replace white pixels that are fully opaque
            data = np.array(img)
            white_mask = (data[:,:,0] > WHITE_THRESHOLD) & \
                         (data[:,:,1] > WHITE_THRESHOLD) & \
                         (data[:,:,2] > WHITE_THRESHOLD) & \
                         (data[:,:,3] > 250)  # Fully opaque
            data[white_mask, 0:3] = GREY_RGB
            result = Image.fromarray(data, 'RGBA')
        else:
            img = img.convert('RGB')
            data = np.array(img)
            
            # Find white/near-white pixels
            white_mask = (data[:,:,0] > WHITE_THRESHOLD) & \
                         (data[:,:,1] > WHITE_THRESHOLD) & \
                         (data[:,:,2] > WHITE_THRESHOLD)
            
            # Replace white pixels with grey
            data[white_mask] = GREY_RGB
            result = Image.fromarray(data)
        
        # Save as PNG
        output_path = img_path.parent / (img_path.stem + '.png')
        result.save(output_path, 'PNG', optimize=True)
        
        print(f"   🎨 Processed: {output_path.name}")
        return output_path
        
    except Exception as e:
        print(f"   ❌ Processing failed: {e}")
        return None

def process_product(product, images_base_dir):
    """Process a single product's images"""
    slug = product.get('slug', '')
    title = product.get('title', slug)
    images = product.get('images', [])
    
    if not images:
        print(f"\n⚠️  {title}: No images found")
        return 0
    
    # Check if any images are from squarespace
    squarespace_images = [img for img in images if is_squarespace_url(img)]
    
    if not squarespace_images:
        print(f"\n✓ {title}: All images are local")
        return 0
    
    print(f"\n📦 Processing: {title}")
    print(f"   Slug: {slug}")
    print(f"   Squarespace images: {len(squarespace_images)}/{len(images)}")
    
    # Create product image folder
    # Try different folder name variants
    folder_variants = [
        slug,
        f"all-products_{slug}",
    ]
    
    product_folder = None
    for variant in folder_variants:
        potential_folder = images_base_dir / variant
        if potential_folder.exists():
            product_folder = potential_folder
            break
    
    if not product_folder:
        # Create with slug
        product_folder = images_base_dir / slug
        product_folder.mkdir(parents=True, exist_ok=True)
        print(f"   📁 Created folder: {product_folder.relative_to(images_base_dir.parent.parent)}")
    else:
        print(f"   📁 Using existing folder: {product_folder.relative_to(images_base_dir.parent.parent)}")
    
    processed_count = 0
    
    # Download and process each squarespace image
    for idx, url in enumerate(squarespace_images):
        filename = get_filename_from_url(url, idx)
        temp_path = product_folder / f"temp_{filename}"
        
        # Download image
        if download_image(url, temp_path):
            # Check if has white background
            if has_white_background(temp_path):
                print(f"   🔍 White background detected")
                # Replace white with grey
                result_path = replace_white_with_grey(temp_path)
                if result_path:
                    # Remove temp file
                    temp_path.unlink()
                    processed_count += 1
                else:
                    # Keep original if processing failed
                    final_path = temp_path.parent / filename
                    temp_path.rename(final_path)
                    print(f"   ⚠️  Kept original: {final_path.name}")
            else:
                # No white background, just rename
                final_path = temp_path.parent / filename
                temp_path.rename(final_path)
                print(f"   ✓ No white background, kept as-is: {final_path.name}")
                processed_count += 1
            
            # Brief delay to be respectful
            time.sleep(0.5)
    
    return processed_count

def main():
    # Find the project root
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # Paths
    json_path = project_root / 'scraped_data' / 'all_products_new.json'
    images_base_dir = project_root / 'mavala-hydrogen' / 'public' / 'images'
    
    if not json_path.exists():
        print(f"❌ Product data not found: {json_path}")
        return
    
    if not images_base_dir.exists():
        print(f"❌ Images directory not found: {images_base_dir}")
        return
    
    print("=" * 80)
    print("NAIL CARE PRODUCT IMAGE PROCESSOR")
    print("=" * 80)
    print(f"📄 Loading products from: {json_path.relative_to(project_root)}")
    print(f"📁 Images directory: {images_base_dir.relative_to(project_root)}")
    print(f"🎨 Target grey color: #f5f5f5")
    print("=" * 80)
    
    # Load products
    with open(json_path, 'r', encoding='utf-8') as f:
        all_products = json.load(f)
    
    print(f"\n✅ Loaded {len(all_products)} products")
    
    # Filter nail care products
    nail_care_products = []
    for slug in NAIL_CARE_SLUGS:
        product = next((p for p in all_products if slug in p.get('slug', '')), None)
        if product:
            nail_care_products.append(product)
        else:
            print(f"⚠️  Product not found: {slug}")
    
    print(f"🔍 Found {len(nail_care_products)}/{len(NAIL_CARE_SLUGS)} nail care products")
    
    if not nail_care_products:
        print("\n❌ No nail care products found to process")
        return
    
    # Process each product
    total_processed = 0
    products_updated = 0
    
    for product in nail_care_products:
        count = process_product(product, images_base_dir)
        if count > 0:
            total_processed += count
            products_updated += 1
    
    print("\n" + "=" * 80)
    print("PROCESSING COMPLETE")
    print("=" * 80)
    print(f"Products updated: {products_updated}/{len(nail_care_products)}")
    print(f"Images processed: {total_processed}")
    print("\n✨ All nail care images have been downloaded and processed!")
    print("🔄 Restart your development server to see the changes")

if __name__ == '__main__':
    main()

