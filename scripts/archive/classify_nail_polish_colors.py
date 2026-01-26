"""
Automatic Nail Polish Color Classification
Uses dominant color extraction to categorize shades by analyzing bottle images
"""

from PIL import Image
import numpy as np
from sklearn.cluster import KMeans
import json
import os
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

def get_dominant_color(image_path):
    """Extract dominant color from a nail polish bottle image"""
    try:
        img = Image.open(image_path)
        img = img.convert('RGB')
        
        # Resize for faster processing
        img = img.resize((150, 150))
        
        # Convert to numpy array
        pixels = np.array(img).reshape(-1, 3)
        
        # Remove very dark (background) and very light (highlights) pixels
        # Focus on the actual nail polish color
        mask = (pixels.sum(axis=1) > 50) & (pixels.sum(axis=1) < 700)
        filtered_pixels = pixels[mask]
        
        if len(filtered_pixels) == 0:
            filtered_pixels = pixels
        
        # Find dominant color using K-means
        kmeans = KMeans(n_clusters=1, random_state=42, n_init=10)
        kmeans.fit(filtered_pixels)
        
        # Return the dominant color
        dominant_color = kmeans.cluster_centers_[0]
        return dominant_color.astype(int)
    
    except Exception as e:
        print(f"  ⚠️  Error processing {Path(image_path).name}: {e}")
        return None

def rgb_to_color_name(rgb):
    """Map RGB values to color names - Optimized for nail polish colors"""
    r, g, b = rgb
    
    # White/Light
    if r > 220 and g > 220 and b > 220:
        return 'White'
    
    # Black/Dark
    if r < 50 and g < 50 and b < 50:
        return 'Black'
    
    # Gray
    if abs(r - g) < 30 and abs(g - b) < 30 and abs(r - b) < 30:
        if 50 <= r <= 180:
            return 'Gray'
    
    # Beige/Nude (before other checks)
    if r > 180 and g > 140 and b > 100 and r > b and abs(r-g) < 50:
        return 'Nude'
    
    # Brown
    if r > g and g > b and r < 180 and g < 140:
        return 'Brown'
    
    # Calculate which color channel dominates
    max_channel = max(r, g, b)
    
    # Red family
    if r == max_channel:
        if g > 150 and b < 100:  # Yellow/Gold
            return 'Golden'
        elif g > 100 and b > 100:  # Pink/Mauve
            if r > 200 and g > 150:
                return 'Pink'
            else:
                return 'Purple'
        elif g < 100 and b < 100:  # Pure red
            return 'Red'
        elif b > g:  # Purple
            return 'Purple'
        else:  # Orange
            if g > 100:
                return 'Orange'
            return 'Red'
    
    # Green family
    elif g == max_channel:
        if r > 150:  # Yellow/Gold
            return 'Golden'
        elif b > 100:  # Teal/Cyan
            return 'Blue'
        else:
            return 'Green'
    
    # Blue family
    elif b == max_channel:
        if r > 150 and g > 150:  # Light blue/cyan
            return 'Blue'
        elif r > 100:  # Purple
            return 'Purple'
        else:
            return 'Blue'
    
    return 'Other'

def classify_product_shades(product_slug):
    """Classify all shades of a product by analyzing their bottle images"""
    
    print(f"\n{'='*70}")
    print(f"🎨 Classifying: {product_slug.upper()}")
    print(f"{'='*70}\n")
    
    # Load product data from detailed products
    product_file = f'scraped_data/products_detailed/{product_slug}.json'
    
    if not os.path.exists(product_file):
        print(f"❌ Product file not found: {product_file}")
        return None
    
    with open(product_file, 'r', encoding='utf-8') as f:
        product = json.load(f)
    
    shades = product.get('shades', [])
    if not shades:
        print(f"❌ No shades found for this product")
        return None
    
    # Check if we have local images
    images_dir = f'scraped_data/images/{product_slug}'
    if not os.path.exists(images_dir):
        print(f"❌ Images directory not found: {images_dir}")
        print(f"💡 Download images first or update image paths")
        return None
    
    print(f"Found {len(shades)} shades")
    print(f"Images directory: {images_dir}\n")
    
    # Process each shade
    shade_colors = []
    
    for i, shade in enumerate(shades):
        shade_name = shade.get('name', '')
        shade_image_url = shade.get('image', '')
        
        # Find local image file
        # Images are named like: "01_49+WHITE.png" or similar
        image_files = list(Path(images_dir).glob(f"*{shade_name.replace(' ', '+')}*"))
        if not image_files:
            # Try without number prefix
            image_files = list(Path(images_dir).glob(f"*{shade_name.split()[-1]}*"))
        
        if not image_files:
            print(f"⚠️  {i+1:2}. {shade_name:30} → Image not found locally")
            continue
        
        image_path = str(image_files[0])
        
        # Extract dominant color
        dominant_color = get_dominant_color(image_path)
        
        if dominant_color is not None:
            # Map to color name
            color_name = rgb_to_color_name(dominant_color)
            
            shade_colors.append({
                'name': shade_name,
                'rgb': dominant_color.tolist(),
                'color': color_name,
                'image': image_path
            })
            
            rgb_str = f"RGB({dominant_color[0]:3},{dominant_color[1]:3},{dominant_color[2]:3})"
            print(f"✓ {i+1:2}. {shade_name:30} → {color_name:10} {rgb_str}")
        else:
            print(f"✗ {i+1:2}. {shade_name:30} → Failed to extract color")
    
    # Group by color
    print(f"\n{'='*70}")
    print("📊 COLOR DISTRIBUTION")
    print(f"{'='*70}\n")
    
    color_groups = {}
    for shade_info in shade_colors:
        color = shade_info['color']
        if color not in color_groups:
            color_groups[color] = []
        color_groups[color].append(shade_info['name'])
    
    # Sort and display
    total = 0
    for color, shades_list in sorted(color_groups.items(), key=lambda x: len(x[1]), reverse=True):
        count = len(shades_list)
        total += count
        print(f"  {color:12} ({count:2} shades): {', '.join(shades_list[:4])}{'...' if len(shades_list) > 4 else ''}")
    
    print(f"\n  {'TOTAL':12} ({total:2} / {len(shades)} shades classified)")
    
    if total < len(shades):
        missing = len(shades) - total
        print(f"  ⚠️  {missing} shades not classified (images missing or processing failed)")
    
    # Save mapping
    output_file = f'color_mapping_{product_slug}.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'product_slug': product_slug,
            'total_shades': len(shades),
            'classified_shades': total,
            'color_groups': color_groups,
            'shade_details': shade_colors
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Saved color mapping to: {output_file}")
    
    return color_groups

if __name__ == "__main__":
    # Classify Cream Colors product
    print("🚀 Starting Automatic Color Classification\n")
    color_groups = classify_product_shades('cream-colors')
    
    if color_groups:
        print(f"\n{'='*70}")
        print("✨ CLASSIFICATION COMPLETE!")
        print(f"{'='*70}")
        print("\n💡 Next steps:")
        print("   1. Review color_mapping_cream-colors.json")
        print("   2. Adjust color detection thresholds if needed")
        print("   3. Use this mapping in the React component")
    else:
        print("\n❌ Classification failed. Check errors above.")
