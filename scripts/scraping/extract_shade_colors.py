"""
Extract dominant colors from shade bottle images
Creates a JSON mapping of shade names to hex colors
"""

from PIL import Image
from collections import Counter
from pathlib import Path
import json
import colorsys

def get_dominant_color(image_path, sample_area='center'):
    """
    Extract the dominant color from a nail polish bottle image.
    Focuses on the center area where the polish color is visible.
    """
    try:
        img = Image.open(image_path)
        img = img.convert('RGB')
        
        width, height = img.size
        
        # Focus on the center-bottom area of the image where the polish is
        # The bottle label is usually in the bottom half
        left = int(width * 0.3)
        right = int(width * 0.7)
        top = int(height * 0.3)
        bottom = int(height * 0.7)
        
        # Crop to the region of interest
        cropped = img.crop((left, top, right, bottom))
        
        # Resize for faster processing
        cropped = cropped.resize((50, 50))
        
        # Get all pixels
        pixels = list(cropped.getdata())
        
        # Filter out near-white, near-black, and very light colors (background/reflection)
        filtered_pixels = []
        for r, g, b in pixels:
            # Skip whites, near-whites, and very light colors
            if r > 240 and g > 240 and b > 240:
                continue
            # Skip blacks and near-blacks
            if r < 15 and g < 15 and b < 15:
                continue
            # Skip grays (low saturation)
            max_val = max(r, g, b)
            min_val = min(r, g, b)
            if max_val > 0:
                saturation = (max_val - min_val) / max_val
                # Keep colors with some saturation, or darker colors
                if saturation < 0.1 and max_val > 200:
                    continue
            
            filtered_pixels.append((r, g, b))
        
        if not filtered_pixels:
            # Fallback to all pixels if filtering removed everything
            filtered_pixels = pixels
        
        # Find most common color
        color_counts = Counter(filtered_pixels)
        
        # Get top colors and find the most saturated/vibrant one
        top_colors = color_counts.most_common(20)
        
        best_color = None
        best_score = -1
        
        for color, count in top_colors:
            r, g, b = color
            # Convert to HSV to check saturation
            h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
            
            # Score based on saturation and frequency
            score = s * 0.7 + (count / len(filtered_pixels)) * 0.3
            
            if score > best_score:
                best_score = score
                best_color = color
        
        if best_color is None:
            best_color = top_colors[0][0] if top_colors else (128, 128, 128)
        
        return best_color
        
    except Exception as e:
        print(f"  Error processing {image_path}: {e}")
        return None


def rgb_to_hex(rgb):
    """Convert RGB tuple to hex string"""
    return '#{:02x}{:02x}{:02x}'.format(*rgb)


def extract_all_shade_colors(shades_dir, output_file):
    """
    Extract colors from all shade folders and save to JSON
    """
    shades_path = Path(shades_dir)
    
    if not shades_path.exists():
        print(f"Error: Directory not found: {shades_dir}")
        return
    
    shade_colors = {}
    import os
    folders = sorted([shades_path / f for f in os.listdir(shades_path) if (shades_path / f).is_dir()])
    
    print(f"Processing {len(folders)} shade folders...")
    print("-" * 60)
    
    for idx, folder in enumerate(folders, 1):
        shade_name = folder.name
        
        # Find the first PNG image (bottle image)
        images = sorted(folder.glob("*.png"))
        if not images:
            images = sorted(folder.glob("*.jpg"))
        
        if not images:
            print(f"[{idx}/{len(folders)}] {shade_name}: No images found")
            continue
        
        # Use the first image (usually 01.png - the bottle)
        bottle_image = images[0]
        
        # Extract dominant color
        rgb = get_dominant_color(bottle_image)
        
        if rgb:
            hex_color = rgb_to_hex(rgb)
            shade_colors[shade_name] = {
                'hex': hex_color,
                'rgb': list(rgb)
            }
            print(f"[{idx}/{len(folders)}] {shade_name}: {hex_color}")
        else:
            print(f"[{idx}/{len(folders)}] {shade_name}: Failed to extract color")
    
    # Save to JSON
    output_path = Path(output_file)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(shade_colors, f, indent=2, ensure_ascii=False)
    
    print("-" * 60)
    print(f"[OK] Saved {len(shade_colors)} shade colors to: {output_file}")
    
    return shade_colors


if __name__ == "__main__":
    # Source: scraped shade images
    shades_dir = "mavala-hydrogen/public/images/shades"
    
    # Output: JSON file with shade colors
    output_file = "mavala-hydrogen/app/data/shade_colors.json"
    
    # Make sure output directory exists
    Path(output_file).parent.mkdir(parents=True, exist_ok=True)
    
    # Extract colors
    extract_all_shade_colors(shades_dir, output_file)

