"""
Verify which nail care products have local images vs Squarespace URLs
"""
import json
from pathlib import Path
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Nail care product slugs
NAIL_CARE_SLUGS = [
    "mavala-scientifique-k", "mavala-scientifique", "nailactan", "mava-flex", "mavaderma",
    "mavapen", "lightening-scrub-mask", "cuticle-remover", "cuticle-cream", "cuticle-oil",
    "cuticle-care-kit", "nail-shield", "ridge-filler", "mava-white", "mavala-stop",
    "mavala-stop-pen", "post-artificial-nails-kit", "mava-strong", "mavala-002-protective-base-coat",
    "barrier-base-coat", "colorfix", "gel-finish-top-coat", "star-top-coat", "oil-seal-dryer",
    "mavadry", "mavadry-spray", "perfect-manicure-kit", "mini-emery-boards", "emery-boards",
    "manicure-sticks", "nail-white-crayon", "hoofstick", "nail-buffer-kit", "manicure-bowl",
    "manicure-pill", "nail-brush", "french-manicure-stickers", "pedi-pads", "scissors",
    "straight-cuticle-scissors", "baby-nail-scissors", "cuticle-nippers", "nail-nippers",
    "toenail-nippers", "clippers", "professional-manicure-tray", "blue-nail-polish-remover",
    "pink-nail-polish-remover", "crystal-nail-polish-remover", "correcteur-pen",
    "nail-polish-remover-pads", "make-up-remover-cotton-pads",
]

def is_squarespace_url(url):
    """Check if URL is from squarespace"""
    return url and ('squarespace-cdn.com' in url or 'squarespace.com' in url)

def check_local_images(slug, images_base_dir):
    """Check if product has local images"""
    folder_variants = [slug, f"all-products_{slug}", "all-products"]
    
    for variant in folder_variants:
        folder_path = images_base_dir / variant
        if folder_path.exists() and folder_path.is_dir():
            image_files = list(folder_path.glob('*.png')) + list(folder_path.glob('*.jpg'))
            if image_files:
                return True, folder_path.name, len(image_files)
    
    return False, None, 0

def main():
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    json_path = project_root / 'scraped_data' / 'all_products_new.json'
    images_base_dir = project_root / 'mavala-hydrogen' / 'public' / 'images'
    
    print("=" * 80)
    print("NAIL CARE IMAGE VERIFICATION")
    print("=" * 80)
    
    # Load products
    with open(json_path, 'r', encoding='utf-8') as f:
        all_products = json.load(f)
    
    local_count = 0
    squarespace_count = 0
    missing_count = 0
    
    print("\n📊 Product Image Status:\n")
    
    for slug in NAIL_CARE_SLUGS:
        product = next((p for p in all_products if slug in p.get('slug', '')), None)
        
        if not product:
            print(f"❌ {slug:40s} - NOT FOUND IN DATA")
            missing_count += 1
            continue
        
        title = product.get('title', slug)[:35]
        images = product.get('images', [])
        
        if not images:
            print(f"⚠️  {title:40s} - NO IMAGES")
            continue
        
        # Check if has squarespace URLs
        has_squarespace = any(is_squarespace_url(img) for img in images)
        
        # Check if has local images
        has_local, folder, count = check_local_images(product.get('slug', slug), images_base_dir)
        
        if has_local:
            if has_squarespace:
                print(f"🟡 {title:40s} - LOCAL ({count} files) + SQUARESPACE")
                local_count += 1
            else:
                print(f"✅ {title:40s} - LOCAL ONLY ({count} files)")
                local_count += 1
        else:
            if has_squarespace:
                print(f"🔴 {title:40s} - SQUARESPACE ONLY")
                squarespace_count += 1
            else:
                print(f"⚠️  {title:40s} - NO VALID IMAGES")
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"✅ Products with local images:    {local_count}")
    print(f"🔴 Products still using Squarespace: {squarespace_count}")
    print(f"❌ Products not found:            {missing_count}")
    print(f"📦 Total nail care products:      {len(NAIL_CARE_SLUGS)}")
    
    if squarespace_count == 0 and missing_count == 0:
        print("\n🎉 All nail care products now have local images!")
    elif squarespace_count > 0:
        print(f"\n⚠️  {squarespace_count} products still need processing")

if __name__ == '__main__':
    main()

