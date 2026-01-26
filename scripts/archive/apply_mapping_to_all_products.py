"""
Apply Official Mavala Color Mapping to ALL Nail Polish Products
"""

import json
import os
import sys
import re
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

# Official Mavala Mapping (Complete Version)
OFFICIAL_MAVALA_MAPPING = {
    "Black": ["048", "163"],
    "Blue": ["059", "115", "158", "167", "171", "181", "219", "238", "269", "287", "301", "343", "417", "447", "457", "466", "486", "946", "975"],
    "Brown": ["032", "034", "081", "151", "310", "370", "403", "451", "971", "972", "991"],
    "Gold": ["970"],
    "Green": ["025", "123", "166", "183", "304", "414", "949", "982"],
    "Grey": ["012", "039", "217", "218", "229", "401", "402", "453", "463", "969", "973"],
    "Nude": ["006", "090", "091", "132", "165", "186", "268", "311", "318", "366", "396", "406", "446", "448", "471", "474", "475", "476", "477", "478", "479", "480", "993"],
    "Orange": ["020", "050", "088", "127", "182", "302", "345", "426", "445", "454", "458", "482"],
    "Pink": ["009", "011", "013", "014", "016", "017", "019", "044", "052", "055", "056", "065", "071", "075", "076", "083", "084", "097", "098", "114", "157", "162", "164", "168", "169", "172", "180", "188", "189", "190", "215", "225", "244", "253", "283", "285", "288", "303", "312", "316", "317", "322", "323", "325", "328", "338", "367", "418", "425", "427", "429", "431", "444", "450", "455", "459", "464", "468", "469", "473", "481", "944"],
    "Purple": ["024", "029", "030", "062", "152", "184", "237", "239", "245", "305", "315", "319", "321", "395", "415", "430", "435", "467"],
    "Red": ["001", "002", "003", "007", "027", "033", "046", "053", "063", "064", "069", "072", "074", "078", "092", "156", "185", "187", "206", "240", "248", "266", "286", "292", "306", "326", "327", "339", "364", "372", "381", "449", "452", "462", "945"],
    "Silver": ["213", "947"],
    "Transparent": ["040", "041", "042", "043"],
    "White": ["004", "022", "047", "049", "324", "399", "461", "465"],
    "Yellow": ["179", "416", "428", "472", "483", "985"]
}

# Create reverse mapping
SHADE_TO_COLOR = {}
for color, shade_nums in OFFICIAL_MAVALA_MAPPING.items():
    for shade_num in shade_nums:
        SHADE_TO_COLOR[shade_num] = color
        SHADE_TO_COLOR[shade_num.lstrip('0')] = color

# Invalid/corrupted entries to skip
INVALID_PATTERNS = [
    "VERNIS PROF",
    "MINI COLOR WITH REFLECTION",
    "90927"
]

def is_invalid_shade(shade_name):
    """Check if a shade name is invalid/corrupted"""
    for pattern in INVALID_PATTERNS:
        if pattern in shade_name:
            return True
    return False

def extract_shade_number(shade_name):
    """Extract shade number from name"""
    match = re.match(r'^(\d+)', shade_name.strip())
    if match:
        num = match.group(1)
        return num.zfill(3), num.lstrip('0')
    return None, None

def get_color_for_shade(shade_name):
    """Get color category for a shade"""
    num_3digit, num_stripped = extract_shade_number(shade_name)
    
    if not num_3digit:
        return "Special"
    
    if num_3digit in SHADE_TO_COLOR:
        return SHADE_TO_COLOR[num_3digit]
    
    if num_stripped in SHADE_TO_COLOR:
        return SHADE_TO_COLOR[num_stripped]
    
    return "Special"

def is_nail_polish_product(product_slug, product_data):
    """Determine if a product is a nail polish (not makeup)"""
    # Exclude makeup products
    makeup_keywords = [
        'mascara', 'lipstick', 'lip-liner', 'lip-gloss', 'lip-shine',
        'eye-shadow', 'eyelid', 'eye-liner', 'eyebrow', 'khol', 'kajal',
        'foundation', 'powder', 'concealer', 'bb-cream', 'pencil'
    ]
    
    for keyword in makeup_keywords:
        if keyword in product_slug.lower():
            return False
    
    # Check if product has shades with numeric names (typical for nail polish)
    shades = product_data.get('shades', [])
    if not shades:
        return False
    
    # If at least 50% of shades have numeric names, it's likely nail polish
    numeric_count = 0
    for shade in shades[:10]:  # Sample first 10
        shade_name = shade.get('name', '')
        if re.match(r'^\d+', shade_name):
            numeric_count += 1
    
    return numeric_count >= len(shades[:10]) * 0.3  # At least 30% numeric

def process_product(product_slug, product_path):
    """Process a single product"""
    try:
        with open(product_path, 'r', encoding='utf-8') as f:
            product_data = json.load(f)
    except:
        return None
    
    # Check if it's a nail polish product
    if not is_nail_polish_product(product_slug, product_data):
        return None
    
    shades = product_data.get('shades', [])
    if not shades:
        return None
    
    color_groups = {}
    shade_details = []
    classified = 0
    skipped = []
    
    for shade in shades:
        shade_name = shade.get('name', '')
        if not shade_name or is_invalid_shade(shade_name):
            skipped.append(shade_name)
            continue
        
        color = get_color_for_shade(shade_name)
        
        if color not in color_groups:
            color_groups[color] = []
        color_groups[color].append(shade_name)
        classified += 1
        
        shade_details.append({
            "name": shade_name,
            "color": color,
            "image": shade.get('image', '')
        })
    
    if classified == 0:
        return None
    
    output_data = {
        "product_slug": product_slug,
        "source": "Official Mavala Color Categorization by Shade Number",
        "version": 2,
        "total_shades": classified,
        "color_groups": color_groups,
        "shade_details": shade_details
    }
    
    return output_data

def main():
    """Process all nail polish products"""
    print("="*70)
    print("🎨 APPLYING MAVALA MAPPING TO ALL NAIL POLISH PRODUCTS")
    print("="*70)
    
    products_dir = Path('scraped_data/products_detailed')
    output_dir = Path('mavala-hydrogen/app/data')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    processed = []
    skipped = []
    
    for product_file in sorted(products_dir.glob('*.json')):
        product_slug = product_file.stem
        
        print(f"\n📦 {product_slug}")
        
        result = process_product(product_slug, product_file)
        
        if result:
            # Save mapping file
            output_path = output_dir / f'color_mapping_{product_slug}.json'
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            
            special_count = len(result['color_groups'].get('Special', []))
            print(f"  ✅ {result['total_shades']} shades", end='')
            if special_count > 0:
                print(f" ({special_count} special)", end='')
            print()
            
            processed.append((product_slug, result['total_shades'], special_count))
        else:
            print(f"  ⊘ Skipped (not nail polish or no shades)")
            skipped.append(product_slug)
    
    print("\n" + "="*70)
    print("✅ PROCESSING COMPLETE!")
    print("="*70)
    print(f"\n✅ Processed: {len(processed)} nail polish products")
    print(f"⊘ Skipped: {len(skipped)} non-nail-polish products")
    
    if processed:
        print(f"\n📊 Successfully Processed:")
        for slug, total, special in processed:
            special_str = f" ({special} special)" if special > 0 else ""
            print(f"  • {slug}: {total} shades{special_str}")
    
    print("="*70)

if __name__ == "__main__":
    main()







