"""
Verify scraped products against mavala.com.au/all-products
"""
import json
import os
from pathlib import Path
import re

# Load scraped products
with open('scraped_data/all_products.json', 'r', encoding='utf-8') as f:
    all_products = json.load(f)

# Filter products from all-products page
all_products_page = [p for p in all_products if p.get('slug', '').startswith('all-products_')]

# Products from website (from provided content)
website_products = [
    "MAVALA SCIENTIFIQUE K+", "MAVALA SCIENTIFIQUE", "NAILACTAN", "MAVA-FLEX",
    "MAVADERMA", "MAVAPEN", "LIGHTENING SCRUB MASK", "CUTICLE REMOVER",
    "CUTICLE CREAM", "CUTICLE OIL", "NAIL SHIELD", "RIDGE FILLER",
    "MAVA-WHITE", "MAVALA STOP", "MAVALA STOP PEN", "MAVA-STRONG",
    "MAVALA 002 PROTECTIVE BASE COAT", "BARRIER-BASE COAT", "COLORFIX",
    "GEL FINISH TOP COAT", "STAR TOP COAT", "OIL SEAL DRYER", "MAVADRY",
    "MAVADRY SPRAY", "MINI EMERY BOARDS EMOJI", "EMERY BOARDS",
    "MANICURE STICKS", "NAIL WHITE CRAYON", "HOOFSTICK", "NAIL BUFFER KIT",
    "MANICURE BOWL", "MANICURE PILL", "NAIL BRUSH", "FRENCH MANICURE STICKER GUIDES",
    "PEDI-PADS", "NAIL SCISSORS", "CUTICLE SCISSORS", "BABY NAIL SCISSORS",
    "CUTICLE NIPPERS", "NAIL NIPPERS", "TOENAIL NIPPERS", "NAIL CLIPPERS",
    "BLUE NAIL POLISH REMOVER", "PINK NAIL POLISH REMOVER", "CRYSTAL NAIL POLISH REMOVER",
    "CORRECTEUR PEN", "NAIL POLISH REMOVER PADS", "MAKE-UP REMOVER COTTON PADS",
    "THINNER FOR NAIL POLISH", "MAVA-CLEAR", "HAND CREAM", "PREBIOTIC HAND CREAM",
    "MAVA+ HAND CREAM", "ANTI-SPOT CREAM FOR HANDS", "REJUVENATING MASK",
    "REPAIRING NIGHT CREAM", "COTTON GLOVES", "SMOOTHING SCRUB CREAM FOR FEET",
    "CONDITIONING MOISTURISER FOR FEET", "HYDRO-REPAIRING FOOT CARE",
    "SOOTHING FOOT BATH SALTS", "REFRESHING FOOT GEL", "REVITALISING EMULSION FOR LEGS",
    "CONCENTRATED FOOT BATH", "FOOT TALCUM POWDER", "DEODORISING FOOT GEL",
    "THE BASICS", "CREAM COLOR's", "PEARL COLOR's", "WHITE SHADES", "NUDE SHADES",
    "PINK SHADES", "RED SHADES", "CORAL SHADES", "ORANGE SHADES", "PURPLE SHADES",
    "BURGUNDY SHADES", "BLUE SHADES", "GREEN SHADES", "YELLOW SHADES", "GOLD SHADES",
    "BROWN SHADES", "GREY SHADES", "BLACK SHADES", "SPARKLY SHADES", "10ML SIZE BOTTLES",
    "DOUBLE-LASH", "DOUBLE-BROW", "EYE CONTOUR GEL", "EYE CONTOUR DOUBLE CREAM",
    "EYE BASE", "REMOVER LOTION", "TOTAL BI-PHASE MAKEUP REMOVER", "REMOVER GEL",
    "EYE MAKEUP REMOVER PADS", "MAKEUP CORRECTOR PEN", "COSMETIC PENCIL SHARPENER",
    "KHOL-KAJAL EYE CONTOUR PENCIL", "SOFT KHOL EYE CONTOUR PENCIL", "LIQUID EYE LINER",
    "VL MASCARA WATERPROOF", "WATERPROOF MASCARA", "CREAMY MASCARA", "EYEBROW PENCIL",
    "GOLD TIP TWEEZERS", "EYE SHADOW CRAYON", "SILKY EYE SHADOW WATERPROOF",
    "SATIN EYELID POWDER", "DUO SATIN EYELID POWDER", "CHRONOBIOLOGICAL DAY SERUM",
    "CHRONOBIOLOGICAL DAY CREAM", "TIME RELEASE SYSTEM NIGHT CARE",
    "ANTI-AGE NUTRITION ESSENTIAL SERUM", "ANTI-AGE NUTRITION ULTIMATE CREAM",
    "ANTI-AGE NUTRITION ABSOLUTE NIGHT BALM", "MULTI-MOISTURIZING INTENSIVE SERUM",
    "MULTI-MOISTURIZING FEATHERLIGHT CREAM", "MULTI-MOISTURIZING SLEEPING MASK",
    "MULTI-MOISTURIZING SNOW MASK", "VITALIZING HEALTHY GLOW SERUM",
    "VITALIZING HEALTHY GLOW DAY CREAM", "SLEEPING MASK BABY SKIN RADIANCE",
    "VITALIZING ALPINE MICRO-MIST", "BEAUTY ENHANCING MICRO-PEEL",
    "PERFECTING HYDRA-MATT FLUID", "PERFECTING PURIFYING MASK",
    "PERFECTING FOAMING CLEANSER", "PERFECTING TONING LOTION",
    "ALPINE SOFTNESS MICELLAR WATER", "CARESS CLEANSING MILK",
    "CARESS TONING LOTION", "BB CREAM", "SERUM FOUNDATION", "DREAM FOUNDATION",
    "PERFECT CONCEALER", "WET AND DRY POWDER", "PRESSED POWDER", "MAGIC POWDER",
    "KABUKI BRUSH", "LIP BALM", "TINTED LIP BALM", "LIP GLOSS", "MAVALIP LIPSTICK",
    "MAVALA LIPSTICK", "LIP-SHINE LIPSTICK", "LIP LINER PENCIL", "TANOA HAIR & BODY OIL",
    "POP WAVE", "NEO NUDES", "TERRA TOPIA COLORS", "YUMMY COLORS", "WHISPER COLORS",
    "TIMELESS COLORS", "COLOR BLOCK", "DIGITAL ART", "BIO COLORS", "TANDEM",
    "DELIGHT", "SO FUTURE", "PRISMATIC", "COLOR VIBE", "ICONIC", "FLOWER MAGIC",
    "TWIST & SHINE", "PASTEL FIESTA", "CHARMING", "POOLSIDE", "CHILL & RELAX",
    "RETRO", "DASH & SPLASH", "SOLARIS", "HERITAGE", "BUBBLE GUM", "CYBER CHIC",
    "BLUSH COLOR'S", "NEW LOOK", "COSMIC", "ECLECTIC", "I LOVE MINI COLOR'S",
    "FIRST CLASS", "SELECT", "CHILI & SPICE", "DELIGHTFUL KIT", "FRENCH MANICURE KIT",
    "CHRISTMAS MAGIC TREE KIT", "A ROSE BY ANY OTHER NAME", "4 COLOR'S CUBE",
    "POST ARTIFICIAL NAILS KIT", "CUTICLE CARE KIT", "PERFECT MANICURE KIT",
    "EXTRA SOFT FOOT CARE DUO PACK", "MINI COLOR'S COLLECTION SET",
    "MINI MANICURE COFFRET", "LASH PARTY POUCH", "THE ESSENTIALS MULTI-MOISTURIZING KIT",
    "THE ESSENTIALS HEALTHY GLOW KIT", "CHRONOBIOLOGY THE SECRET OF YOUTH KIT",
    "PROFESSIONAL MANICURE TRAY", "GIFT CARD"
]

def extract_product_name_from_slug(slug):
    """Extract product name from slug"""
    if not slug:
        return ""
    # Remove 'all-products_' prefix
    name = slug.replace('all-products_', '')
    # Replace hyphens with spaces and title case
    name = name.replace('-', ' ').title()
    return name

def normalize_name(name):
    """Normalize product name for comparison"""
    return re.sub(r'[^A-Z0-9]', '', name.upper())

print("="*80)
print("PRODUCT VERIFICATION REPORT")
print("="*80)
print(f"\n📦 Scraped Products: {len(all_products_page)}")
print(f"🌐 Website Products: {len(website_products)}")

# Check images
img_dir = Path('scraped_data/images')
all_prod_folders = [d.name for d in img_dir.iterdir() if d.is_dir() and d.name.startswith('all-products_')]

products_with_images = []
products_without_images = []

for p in all_products_page:
    slug = p.get('slug', '')
    images = p.get('images', [])
    folder_exists = slug in all_prod_folders
    
    if images or folder_exists:
        products_with_images.append(p)
    else:
        products_without_images.append(p)

print(f"\n📸 Products with images: {len(products_with_images)}")
print(f"❌ Products without images: {len(products_without_images)}")
print(f"📁 Image folders found: {len(all_prod_folders)}")

# Match products
matched = []
not_matched = []

for wp in website_products:
    wp_normalized = normalize_name(wp)
    found = False
    
    for p in all_products_page:
        slug = p.get('slug', '')
        slug_name = extract_product_name_from_slug(slug)
        slug_normalized = normalize_name(slug_name)
        
        # Try to match
        if (wp_normalized in slug_normalized or 
            slug_normalized in wp_normalized or
            wp_normalized == slug_normalized):
            images_count = len(p.get('images', []))
            folder_exists = slug in all_prod_folders
            matched.append({
                'website_name': wp,
                'slug': slug,
                'extracted_name': slug_name,
                'has_images_array': images_count > 0,
                'has_image_folder': folder_exists,
                'images_count': images_count
            })
            found = True
            break
    
    if not found:
        not_matched.append(wp)

print(f"\n✅ Matched: {len(matched)}/{len(website_products)}")
print(f"❌ Not matched: {len(not_matched)}/{len(website_products)}")

# Sample matched products
print("\n" + "="*80)
print("SAMPLE MATCHED PRODUCTS (first 20):")
print("="*80)
for m in matched[:20]:
    img_status = "✅" if (m['has_images_array'] or m['has_image_folder']) else "❌"
    print(f"{img_status} {m['website_name']:40} -> {m['slug']:50} ({m['images_count']} images)")

if not_matched:
    print("\n" + "="*80)
    print("PRODUCTS NOT FOUND IN SCRAPED DATA:")
    print("="*80)
    for wp in not_matched[:20]:
        print(f"  - {wp}")

# Summary
print("\n" + "="*80)
print("SUMMARY:")
print("="*80)
print(f"✅ Total scraped products: {len(all_products_page)}")
print(f"✅ Products with images (array): {sum(1 for p in all_products_page if p.get('images'))}")
print(f"✅ Products with image folders: {len(all_prod_folders)}")
print(f"✅ Website products matched: {len(matched)}/{len(website_products)}")
print(f"❌ Website products not matched: {len(not_matched)}")

# Check a sample product folder
if all_prod_folders:
    sample_folder = all_prod_folders[0]
    sample_path = img_dir / sample_folder
    if sample_path.exists():
        files = list(sample_path.iterdir())
        image_files = [f for f in files if f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']]
        print(f"\n📁 Sample folder '{sample_folder}': {len(image_files)} image files")
        if image_files:
            print(f"   Sample files: {[f.name for f in image_files[:3]]}")










