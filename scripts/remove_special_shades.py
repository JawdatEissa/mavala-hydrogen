"""
Script to remove "Special" category shades from all color mapping files.
Also removes the corresponding shade_details entries.
"""
import json
import os
from pathlib import Path

def remove_special_from_mapping(file_path):
    """Remove Special category and its shades from a color mapping file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        modified = False
        special_shades = []
        
        # Get list of Special shades before removing
        if 'color_groups' in data and 'Special' in data['color_groups']:
            special_shades = data['color_groups']['Special']
            del data['color_groups']['Special']
            modified = True
            print(f"  Removed {len(special_shades)} Special shades from color_groups")
        
        # Remove corresponding shade_details entries
        if 'shade_details' in data and special_shades:
            original_count = len(data['shade_details'])
            # Normalize shade names for comparison
            special_normalized = set()
            for shade in special_shades:
                # Remove asterisks and normalize
                normalized = shade.replace('*', '').upper().strip()
                special_normalized.add(normalized)
            
            # Filter out special shades from shade_details
            data['shade_details'] = [
                shade for shade in data['shade_details']
                if shade.get('name', '').replace('*', '').upper().strip() not in special_normalized
            ]
            
            removed_count = original_count - len(data['shade_details'])
            if removed_count > 0:
                print(f"  Removed {removed_count} shade_details entries")
                modified = True
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        
        return False
        
    except Exception as e:
        print(f"  Error: {e}")
        return False

def main():
    # Path to color mapping files
    data_dir = Path(__file__).parent.parent / 'mavala-hydrogen' / 'app' / 'data'
    
    if not data_dir.exists():
        print(f"Data directory not found: {data_dir}")
        return
    
    # Find all color mapping files
    mapping_files = list(data_dir.glob('color_mapping_*.json'))
    
    print(f"Found {len(mapping_files)} color mapping files")
    print("=" * 50)
    
    modified_count = 0
    for file_path in mapping_files:
        print(f"\nProcessing: {file_path.name}")
        if remove_special_from_mapping(file_path):
            modified_count += 1
    
    print("\n" + "=" * 50)
    print(f"Modified {modified_count} files")
    print("Special category shades have been removed!")

if __name__ == '__main__':
    main()

