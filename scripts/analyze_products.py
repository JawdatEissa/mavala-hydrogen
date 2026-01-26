"""
Analyze scraped products and compare with mavala.com.au/all-products
"""
import json
import os
from pathlib import Path

# Load scraped products
with open('scraped_data/all_products.json', 'r', encoding='utf-8') as f:
    all_products = json.load(f)

# Filter products from all-products page
all_products_page = [p for p in all_products if p.get('slug', '').startswith('all-products_')]

print(f"📊 ANALYSIS RESULTS\n")
print(f"Total products in all_products.json: {len(all_products)}")
print(f"Products from /all-products page: {len(all_products_page)}\n")

# Check images
has_images = [p for p in all_products_page if p.get('images')]
print(f"Products with images array: {len(has_images)}")
print(f"Products without images: {len(all_products_page) - len(has_images)}\n")

# Check image folders
img_dir = Path('scraped_data/images')
all_prod_folders = [d for d in img_dir.iterdir() if d.is_dir() and d.name.startswith('all-products_')]
print(f"Image folders found: {len(all_prod_folders)}\n")

# Check product titles
products_with_titles = [p for p in all_products_page if p.get('title') and p.get('title').strip()]
products_without_titles = [p for p in all_products_page if not p.get('title') or not p.get('title').strip()]

print(f"Products with titles: {len(products_with_titles)}")
print(f"Products without titles: {len(products_without_titles)}\n")

# Sample products with titles
print("Sample products with titles:")
for p in products_with_titles[:15]:
    title = p.get('title', 'NO TITLE')[:60]
    slug = p.get('slug', 'NO SLUG')
    has_img = '✅' if p.get('images') else '❌'
    print(f"  {has_img} {title} ({slug})")

print("\n" + "="*80)
print("PRODUCTS FROM WEBSITE (from provided content):")
print("="*80)

# Products from the website content provided
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

print(f"Total products listed on website: {len(website_products)}\n")

# Try to match website products with scraped data
print("MATCHING ANALYSIS:")
print("="*80)

matched = []
not_matched = []

for wp in website_products:
    # Try to find in scraped data
    found = False
    for p in all_products_page:
        title = p.get('title', '').upper().strip()
        slug = p.get('slug', '').upper()
        wp_upper = wp.upper()
        
        # Check if title matches or slug contains product name
        if wp_upper in title or title in wp_upper or wp_upper.replace(' ', '-') in slug:
            matched.append((wp, p.get('title', 'NO TITLE'), p.get('slug', ''), bool(p.get('images'))))
            found = True
            break
    
    if not found:
        not_matched.append(wp)

print(f"\n✅ Matched: {len(matched)}/{len(website_products)}")
print(f"❌ Not matched: {len(not_matched)}/{len(website_products)}\n")

if not_matched:
    print("Products from website NOT found in scraped data:")
    for wp in not_matched[:20]:
        print(f"  - {wp}")

print("\n" + "="*80)
print("SUMMARY:")
print("="*80)
print(f"✅ Scraped products: {len(all_products_page)}")
print(f"✅ Products with images: {len(has_images)}")
print(f"✅ Image folders: {len(all_prod_folders)}")
print(f"✅ Website products: {len(website_products)}")
print(f"✅ Matched: {len(matched)}")
print(f"❌ Not matched: {len(not_matched)}")










