"""
Script to extract all nail polish shades from color mapping JSON files
and create a CSV for the Mavala product scraper
"""
import json
import pandas as pd
from pathlib import Path
import re

def extract_shades_from_mapping(json_file):
    """Extract shades from a color mapping JSON file"""
    shades = []
    
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    product_slug = data.get('product_slug', '')
    color_groups = data.get('color_groups', {})
    
    for main_color, shade_list in color_groups.items():
        # EXCLUDE "Special" color group
        if main_color.lower() == 'special':
            continue
            
        for shade in shade_list:
            # Parse shade format: "NUMBER NAME"
            # Example: "49 WHITE", "363 LONG ISLAND"
            match = re.match(r'(\d+)\s+(.+)', shade)
            if match:
                shade_number = match.group(1)
                shade_name = match.group(2)
                
                shades.append({
                    'Main Color': main_color,
                    'Shade Number': shade_number,
                    'Shade Name': shade_name,
                    'Product Slug': product_slug
                })
    
    return shades

def main():
    # Path to color mapping files
    data_dir = Path('mavala-hydrogen/app/data')
    
    # Find all color mapping JSON files
    mapping_files = list(data_dir.glob('color_mapping_*.json'))
    
    print(f"Found {len(mapping_files)} color mapping files")
    
    all_shades = []
    
    for json_file in mapping_files:
        print(f"Processing: {json_file.name}")
        shades = extract_shades_from_mapping(json_file)
        all_shades.extend(shades)
        print(f"  OK Extracted {len(shades)} shades")
    
    # Create DataFrame
    df = pd.DataFrame(all_shades)
    
    # Remove duplicates (same shade number can appear in multiple collections)
    df_unique = df.drop_duplicates(subset=['Shade Number', 'Shade Name'])
    
    # Sort by shade number
    df_unique = df_unique.sort_values('Shade Number')
    
    # Save to CSV
    output_file = 'mavala_products_for_scraping.csv'
    df_unique.to_csv(output_file, index=False)
    
    print(f"\nCreated {output_file}")
    print(f"   Total shades: {len(df_unique)}")
    print(f"\nFirst 5 rows:")
    print(df_unique.head())
    print(f"\nSample URL construction:")
    sample = df_unique.iloc[0]
    print(f"  Main Color: {sample['Main Color']}")
    print(f"  Shade Number: {sample['Shade Number']}")
    print(f"  Shade Name: {sample['Shade Name']}")
    print(f"  URL: https://www.mavala.com/products/mini-color-{sample['Main Color'].lower()}?Color={sample['Shade Number']}.+{sample['Shade Name'].replace(' ', '+')}")

if __name__ == "__main__":
    main()

