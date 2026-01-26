"""
Improved Nail Polish Color Classification - Version 2
- Crops to center of bottle (actual polish)
- Uses HSV color space
- Better filtering of reflections
- Supports 15 color categories
"""

from PIL import Image
import numpy as np
from sklearn.cluster import KMeans
import colorsys
import json
import os
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

def get_dominant_color_improved(image_path):
    """Extract dominant color from nail polish bottle - IMPROVED VERSION"""
    try:
        img = Image.open(image_path)
        img = img.convert('RGB')
        
        width, height = img.size
        
        # CROP TO CENTER OF BOTTLE (where the actual polish is)
        # Skip top 25% (cap area) and bottom 15% (base)
        # Keep center 50% horizontally (avoid edges/glass)
        crop_top = int(height * 0.25)
        crop_bottom = int(height * 0.85)
        crop_left = int(width * 0.25)
        crop_right = int(width * 0.75)
        
        img_cropped = img.crop((crop_left, crop_top, crop_right, crop_bottom))
        
        # Resize for faster processing
        img_cropped = img_cropped.resize((100, 100))
        
        # Convert to numpy array
        pixels = np.array(img_cropped).reshape(-1, 3)
        
        # AGGRESSIVE FILTERING - Remove highlights, glass, and reflections
        # Remove very light pixels (highlights, reflections)
        mask_light = pixels.sum(axis=1) < 680  # was 700
        
        # Remove very dark pixels (shadows, background)
        mask_dark = pixels.sum(axis=1) > 80  # was 50
        
        # Remove very desaturated pixels (glass, neutral tones)
        # Calculate saturation in HSV
        saturations = []
        for pixel in pixels:
            r, g, b = pixel / 255.0
            h, s, v = colorsys.rgb_to_hsv(r, g, b)
            saturations.append(s)
        saturations = np.array(saturations)
        
        # Keep only pixels with decent saturation (actual color, not glass)
        mask_saturation = saturations > 0.15  # was 0.1
        
        # Combine all masks
        mask = mask_light & mask_dark & mask_saturation
        filtered_pixels = pixels[mask]
        
        if len(filtered_pixels) < 50:
            # If too aggressive, relax saturation filter
            mask_saturation_relaxed = saturations > 0.08
            mask = mask_light & mask_dark & mask_saturation_relaxed
            filtered_pixels = pixels[mask]
        
        if len(filtered_pixels) < 20:
            # Last resort - just use all non-extreme pixels
            filtered_pixels = pixels[mask_light & mask_dark]
        
        if len(filtered_pixels) == 0:
            filtered_pixels = pixels
        
        # Find dominant color using K-means (get top 2 colors)
        n_clusters = min(2, len(filtered_pixels))
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        kmeans.fit(filtered_pixels)
        
        # Get the most dominant color (largest cluster)
        labels = kmeans.labels_
        cluster_sizes = np.bincount(labels)
        dominant_cluster = np.argmax(cluster_sizes)
        dominant_color = kmeans.cluster_centers_[dominant_cluster]
        
        return dominant_color.astype(int)
    
    except Exception as e:
        print(f"  ⚠️  Error processing {Path(image_path).name}: {e}")
        return None

def rgb_to_color_name_v2(rgb):
    """
    Map RGB values to 15 color categories using HSV color space
    Categories: Silver, White, Blue, Golden, Gray, Yellow, Brown, Black, 
                Nude, Orange, Pink, Red, Transparent, Green, Purple
    """
    r, g, b = rgb
    
    # Convert to HSV for better color perception
    r_norm, g_norm, b_norm = r/255.0, g/255.0, b/255.0
    h, s, v = colorsys.rgb_to_hsv(r_norm, g_norm, b_norm)
    
    # Convert hue to degrees (0-360)
    hue = h * 360
    saturation = s * 100
    value = v * 100
    
    # === ACHROMATIC COLORS (low saturation) ===
    if saturation < 15:
        if value > 85:
            return 'White'
        elif value < 20:
            return 'Black'
        elif value > 60:
            return 'Silver'
        else:
            return 'Gray'
    
    # === NEAR-NEUTRAL (low saturation but some color) ===
    if saturation < 25:
        if value > 70:
            return 'Nude'
        elif value < 30:
            return 'Black'
        else:
            return 'Gray'
    
    # === CHROMATIC COLORS (by hue) ===
    
    # RED (0-15 and 345-360)
    if (hue >= 345 or hue < 15):
        if saturation < 40 and value > 60:
            return 'Pink'
        return 'Red'
    
    # ORANGE-RED (15-25)
    elif 15 <= hue < 25:
        if saturation < 45:
            return 'Pink'
        return 'Red'
    
    # ORANGE (25-45)
    elif 25 <= hue < 45:
        if value > 75:
            return 'Orange'
        elif saturation < 40:
            return 'Nude'
        return 'Orange'
    
    # YELLOW-ORANGE / GOLDEN (45-60)
    elif 45 <= hue < 60:
        if saturation > 40:
            return 'Golden'
        return 'Yellow'
    
    # YELLOW (60-75)
    elif 60 <= hue < 75:
        return 'Yellow'
    
    # YELLOW-GREEN (75-90)
    elif 75 <= hue < 90:
        if saturation > 40:
            return 'Green'
        return 'Yellow'
    
    # GREEN (90-150)
    elif 90 <= hue < 150:
        return 'Green'
    
    # CYAN / BLUE-GREEN (150-180)
    elif 150 <= hue < 180:
        if saturation > 40:
            return 'Blue'
        return 'Green'
    
    # BLUE (180-250)
    elif 180 <= hue < 250:
        if saturation < 30 and value > 60:
            return 'Silver'
        return 'Blue'
    
    # PURPLE / VIOLET (250-290)
    elif 250 <= hue < 290:
        return 'Purple'
    
    # MAGENTA / PINK-PURPLE (290-320)
    elif 290 <= hue < 320:
        if saturation < 45 or value > 75:
            return 'Pink'
        return 'Purple'
    
    # PINK (320-345)
    elif 320 <= hue < 345:
        if saturation > 50 and value < 60:
            return 'Red'
        return 'Pink'
    
    # Fallback
    return 'Other'

def classify_product_shades_v2(product_slug):
    """Classify all shades using IMPROVED algorithm"""
    
    print(f"\n{'='*70}")
    print(f"🎨 IMPROVED COLOR CLASSIFICATION: {product_slug.upper()}")
    print(f"{'='*70}\n")
    
    # Load product data
    product_file = f'scraped_data/products_detailed/{product_slug}.json'
    
    if not os.path.exists(product_file):
        print(f"❌ Product file not found: {product_file}")
        return None
    
    with open(product_file, 'r', encoding='utf-8') as f:
        product = json.load(f)
    
    shades = product.get('shades', [])
    if not shades:
        print(f"❌ No shades found")
        return None
    
    images_dir = f'scraped_data/images/{product_slug}'
    if not os.path.exists(images_dir):
        print(f"❌ Images directory not found: {images_dir}")
        return None
    
    print(f"📁 Processing {len(shades)} shades")
    print(f"🔬 Using: HSV color space + Center cropping + Aggressive filtering\n")
    
    # Process each shade
    shade_colors = []
    
    for i, shade in enumerate(shades):
        shade_name = shade.get('name', '')
        
        # Find local image file
        image_files = list(Path(images_dir).glob(f"*{shade_name.replace(' ', '+')}*"))
        if not image_files:
            image_files = list(Path(images_dir).glob(f"*{shade_name.split()[-1]}*"))
        
        if not image_files:
            print(f"⚠️  {i+1:2}. {shade_name:30} → Image not found")
            continue
        
        image_path = str(image_files[0])
        
        # Extract dominant color with improved algorithm
        dominant_color = get_dominant_color_improved(image_path)
        
        if dominant_color is not None:
            # Map to color name using HSV-based classification
            color_name = rgb_to_color_name_v2(dominant_color)
            
            # Calculate HSV for display
            r, g, b = dominant_color
            h, s, v = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
            
            shade_colors.append({
                'name': shade_name,
                'rgb': dominant_color.tolist(),
                'hsv': [int(h*360), int(s*100), int(v*100)],
                'color': color_name,
                'image': image_path
            })
            
            rgb_str = f"RGB({dominant_color[0]:3},{dominant_color[1]:3},{dominant_color[2]:3})"
            hsv_str = f"HSV({int(h*360):3}°,{int(s*100):2}%,{int(v*100):2}%)"
            print(f"✓ {i+1:2}. {shade_name:30} → {color_name:12} {rgb_str} {hsv_str}")
        else:
            print(f"✗ {i+1:2}. {shade_name:30} → Failed")
    
    # Group by color
    print(f"\n{'='*70}")
    print("📊 COLOR DISTRIBUTION (15 Categories)")
    print(f"{'='*70}\n")
    
    color_groups = {}
    for shade_info in shade_colors:
        color = shade_info['color']
        if color not in color_groups:
            color_groups[color] = []
        color_groups[color].append(shade_info['name'])
    
    # Sort by count
    total = 0
    color_order = ['White', 'Silver', 'Nude', 'Pink', 'Red', 'Orange', 'Golden', 'Yellow', 
                   'Brown', 'Green', 'Blue', 'Purple', 'Gray', 'Black', 'Transparent', 'Other']
    
    for color in color_order:
        if color in color_groups:
            shades_list = color_groups[color]
            count = len(shades_list)
            total += count
            emoji = {
                'White': '⚪', 'Silver': '⚫', 'Nude': '🟤', 'Pink': '🩷', 'Red': '🔴',
                'Orange': '🟠', 'Golden': '🟡', 'Yellow': '💛', 'Brown': '🤎',
                'Green': '🟢', 'Blue': '🔵', 'Purple': '🟣', 'Gray': '⚫', 
                'Black': '⚫', 'Transparent': '⚪'
            }.get(color, '⭕')
            
            print(f"  {emoji} {color:12} ({count:2} shades): {', '.join(shades_list[:3])}{'...' if len(shades_list) > 3 else ''}")
    
    print(f"\n  ✅ {'TOTAL':12} ({total:2} / {len(shades)} shades)")
    
    # Save
    output_file = f'color_mapping_{product_slug}_v2.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'product_slug': product_slug,
            'version': 2,
            'algorithm': 'HSV + Center Crop + Saturation Filter',
            'total_shades': len(shades),
            'classified_shades': total,
            'color_groups': color_groups,
            'shade_details': shade_colors
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Saved to: {output_file}")
    
    return color_groups

if __name__ == "__main__":
    print("🚀 IMPROVED AI COLOR CLASSIFICATION v2.0")
    print("=" * 70)
    print("Improvements:")
    print("  ✓ Crops to center of bottle (actual polish area)")
    print("  ✓ Uses HSV color space (better perception)")
    print("  ✓ Aggressive filtering (removes glass/reflections)")
    print("  ✓ Supports 15 color categories")
    print("=" * 70)
    
    color_groups = classify_product_shades_v2('cream-colors')
    
    if color_groups:
        print(f"\n{'='*70}")
        print("✨ CLASSIFICATION COMPLETE!")
        print(f"{'='*70}")
        print("\n💡 Review the results above.")
        print("   If still not perfect, we can:")
        print("   1. Fine-tune thresholds")
        print("   2. Manual corrections for specific shades")
        print("   3. Try even more aggressive filtering")
    else:
        print("\n❌ Classification failed.")







