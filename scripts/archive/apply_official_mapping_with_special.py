"""
Apply Official Mavala Color Mapping with "Special" category for unmapped shades
"""

import json
import os
import sys
import re

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

# Create reverse mapping: Shade Number → Color
SHADE_TO_COLOR = {}
for color, shade_nums in OFFICIAL_MAVALA_MAPPING.items():
    for shade_num in shade_nums:
        # Store both with and without leading zeros
        SHADE_TO_COLOR[shade_num] = color
        SHADE_TO_COLOR[shade_num.lstrip('0')] = color

# Invalid shade names to skip
INVALID_SHADES = [
    "90927 VERNIS PROF.JPG",
    "MINI COLOR WITH REFLECTION"
]

def extract_shade_number(shade_name):
    """Extract the shade number from a shade name"""
    match = re.match(r'^(\d+)', shade_name.strip())
    if match:
        num = match.group(1)
        return num.zfill(3), num.lstrip('0')
    return None, None

def get_color_for_shade(shade_name):
    """Get the color category for a shade based on its number"""
    num_3digit, num_stripped = extract_shade_number(shade_name)
    
    if not num_3digit:
        return "Special"  # Non-numeric shades go to Special
    
    # Try with 3-digit format first
    if num_3digit in SHADE_TO_COLOR:
        return SHADE_TO_COLOR[num_3digit]
    
    # Try with stripped format
    if num_stripped in SHADE_TO_COLOR:
        return SHADE_TO_COLOR[num_stripped]
    
    # If not found in mapping, assign to Special
    return "Special"

def process_product(product_slug, product_data_path):
    """Process a single product and create its color mapping"""
    print(f"\n{'='*70}")
    print(f"Processing: {product_slug}")
    print(f"{'='*70}")
    
    # Load product data
    try:
        with open(product_data_path, 'r', encoding='utf-8') as f:
            product_data = json.load(f)
    except FileNotFoundError:
        print(f"  ⚠ Product data file not found: {product_data_path}")
        return None
    
    shades = product_data.get('shades', [])
    print(f"  Found {len(shades)} total shades")
    
    color_groups = {}
    shade_details = []
    classified = 0
    special_count = 0
    skipped = []
    
    for shade in shades:
        shade_name = shade.get('name', '')
        if not shade_name:
            continue
        
        # Skip invalid shades
        if shade_name in INVALID_SHADES:
            skipped.append(shade_name)
            continue
        
        color = get_color_for_shade(shade_name)
        
        if color not in color_groups:
            color_groups[color] = []
        color_groups[color].append(shade_name)
        classified += 1
        
        if color == "Special":
            special_count += 1
        
        shade_details.append({
            "name": shade_name,
            "color": color,
            "image": shade.get('image', '')
        })
    
    print(f"  ✓ Classified: {classified} shades")
    if special_count > 0:
        print(f"  ⭐ Special category: {special_count} shades")
    if skipped:
        print(f"  🗑 Skipped invalid: {skipped}")
    
    # Create output data
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
    print("🎨 APPLYING OFFICIAL MAVALA COLOR MAPPING")
    print("="*70)
    print("✨ Unmapped shades will be assigned to 'Special' category")
    print("="*70)
    
    # Products to process
    products = [
        ('cream-colors', 'scraped_data/products_detailed/cream-colors.json'),
        # Add more products here as needed
    ]
    
    for product_slug, product_path in products:
        result = process_product(product_slug, product_path)
        
        if result:
            # Save mapping file
            output_path = f'mavala-hydrogen/app/data/color_mapping_{product_slug}.json'
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            
            print(f"  ✅ Saved: {output_path}")
            
            # Print color breakdown
            print(f"\n  Color Breakdown:")
            for color, shades in sorted(result['color_groups'].items(), key=lambda x: -len(x[1])):
                print(f"    {color}: {len(shades)} shades")
                if color == "Special" and len(shades) <= 10:
                    for shade in shades:
                        print(f"      - {shade}")
    
    print("\n" + "="*70)
    print("✅ COMPLETE!")
    print("="*70)

if __name__ == "__main__":
    main()







