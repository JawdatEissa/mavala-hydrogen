"""
Process Mavala Scientifique K+ Third Image V4 - More to the LEFT
=================================================================
This script positions the bottle significantly more to the LEFT side.

Usage:
    python scripts/process_scientifique_k_v4.py
"""

import sys
from pathlib import Path
from PIL import Image
import numpy as np

# Mavala gray background color
GREY_RGB = (245, 245, 245)

def process_image_v4(input_path, output_path):
    """
    Process with bottle positioned MORE to the LEFT.
    """
    print(f"\n{'='*60}")
    print("Mavala Scientifique K+ Image Processor V4")
    print(f"{'='*60}")
    print(f"Input:  {input_path}")
    print(f"Output: {output_path}")
    print(f"{'='*60}\n")
    
    try:
        # Load original image
        print("1. Loading original image...")
        img = Image.open(input_path)
        print(f"   Original: {img.size[0]}x{img.size[1]} pixels")
        
        width, height = img.size
        
        # Step 1: Crop out the right side (removes badge/nail)
        print("\n2. Cropping right side to remove badge...")
        crop_right = int(width * 0.70)  # Keep only left 70%
        img_cropped = img.crop((0, 0, crop_right, height))
        print(f"   Cropped to: {img_cropped.size[0]}x{img_cropped.size[1]} pixels")
        
        # Step 2: Detect bottle bounds and crop bottom
        print("\n3. Finding bottle and cropping bottom...")
        img_array = np.array(img_cropped.convert('RGB'))
        non_white = np.any(img_array < 240, axis=2)
        
        rows = np.any(non_white, axis=1)
        if rows.any():
            top = max(0, np.argmax(rows) - 20)
            bottom = min(len(rows), len(rows) - np.argmax(rows[::-1]) + 50)
            img_cropped = img_cropped.crop((0, top, img_cropped.size[0], bottom))
            print(f"   Cropped bottom, now: {img_cropped.size[0]}x{img_cropped.size[1]} pixels")
        
        # Step 3: Scale up by 80%
        print("\n4. Scaling up bottle by 80%...")
        scale_factor = 1.8
        new_width = int(img_cropped.size[0] * scale_factor)
        new_height = int(img_cropped.size[1] * scale_factor)
        img_scaled = img_cropped.resize((new_width, new_height), Image.Resampling.LANCZOS)
        print(f"   Scaled to: {img_scaled.size[0]}x{img_scaled.size[1]} pixels")
        
        # Step 4: Create canvas and position bottle MORE to the LEFT
        print("\n5. Positioning bottle MORE to the LEFT...")
        canvas_size = max(img_scaled.size[0], img_scaled.size[1])
        canvas = Image.new('RGB', (canvas_size, canvas_size), GREY_RGB)
        
        # Position bottle significantly more to the LEFT
        # 20% from left edge (was 35%, now moving further left)
        x_offset = int((canvas_size - img_scaled.size[0]) * 0.20)
        y_offset = (canvas_size - img_scaled.size[1]) // 2
        
        print(f"   Canvas size: {canvas_size}x{canvas_size}")
        print(f"   Bottle position: x={x_offset}, y={y_offset} (20% from LEFT edge)")
        
        # Paste with alpha channel
        if img_scaled.mode == 'RGBA':
            canvas.paste(img_scaled, (x_offset, y_offset), img_scaled)
        else:
            canvas.paste(img_scaled, (x_offset, y_offset))
        
        # Save result
        print("\n6. Saving processed image...")
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        canvas.save(output_path, 'PNG', optimize=True)
        
        print(f"\n{'='*60}")
        print(f"Success! Saved to: {output_path}")
        print(f"Bottle positioned 20% from LEFT edge")
        print(f"{'='*60}\n")
        
        return True
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    input_path = Path('public/images/mavala-scientifique-k/03.png.backup')
    output_path = Path('public/images/mavala-scientifique-k/03.png')
    
    if not input_path.exists():
        print(f"Error: Backup file not found: {input_path}")
        return 1
    
    success = process_image_v4(input_path, output_path)
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
