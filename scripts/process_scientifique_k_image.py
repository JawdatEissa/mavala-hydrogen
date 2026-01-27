"""
Process Mavala Scientifique K+ Third Image (03.png)
===================================================
This script:
1. Crops out the bottom portion of the image
2. Removes the award badge from the upper right corner
3. Scales up the bottle by 35%
4. Applies gray background (#f5f5f5)

Usage:
    python scripts/process_scientifique_k_image.py
    
    # Or with custom input/output:
    python scripts/process_scientifique_k_image.py --input public/images/mavala-scientifique-k/03.png --output public/images/mavala-scientifique-k/03-processed.png
"""

import argparse
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

# Mavala gray background color
GREY_RGB = (245, 245, 245)

def detect_content_bounds(img, threshold=250):
    """
    Detect the bounding box of non-white content in the image.
    Returns (left, top, right, bottom)
    """
    # Convert to numpy array
    img_array = np.array(img.convert('RGB'))
    
    # Find pixels that are not white (any channel < threshold)
    non_white = np.any(img_array < threshold, axis=2)
    
    # Find bounding box
    rows = np.any(non_white, axis=1)
    cols = np.any(non_white, axis=0)
    
    if not rows.any() or not cols.any():
        return None
    
    top = np.argmax(rows)
    bottom = len(rows) - np.argmax(rows[::-1])
    left = np.argmax(cols)
    right = len(cols) - np.argmax(cols[::-1])
    
    return (left, top, right, bottom)

def remove_badge_region(img, badge_region_percent=25):
    """
    Remove the badge from upper right corner by replacing with gray background.
    badge_region_percent: percentage of width/height to check for badge (default 25%)
    """
    width, height = img.size
    img_array = np.array(img.convert('RGBA'))
    
    # Define upper right region to check
    badge_width = int(width * badge_region_percent / 100)
    badge_height = int(height * badge_region_percent / 100)
    
    # Region bounds (upper right corner)
    left = width - badge_width
    top = 0
    right = width
    bottom = badge_height
    
    print(f"  Checking badge region: ({left}, {top}) to ({right}, {bottom})")
    
    # Replace this region with gray background
    draw = ImageDraw.Draw(img)
    draw.rectangle([left, top, right, bottom], fill=GREY_RGB)
    
    return img

def crop_bottom_whitespace(img, keep_margin=20):
    """
    Crop out excessive bottom whitespace, keeping a small margin.
    """
    bounds = detect_content_bounds(img, threshold=240)
    
    if not bounds:
        print("  Warning: Could not detect content bounds, skipping crop")
        return img
    
    left, top, right, bottom = bounds
    width, height = img.size
    
    # Add margin but don't exceed original bounds
    crop_bottom = min(bottom + keep_margin, height)
    
    print(f"  Original size: {width}x{height}")
    print(f"  Content bounds: ({left}, {top}) to ({right}, {bottom})")
    print(f"  Cropping to: (0, 0) to ({width}, {crop_bottom})")
    
    # Crop the image
    cropped = img.crop((0, 0, width, crop_bottom))
    
    return cropped

def scale_image(img, scale_factor=1.35):
    """
    Scale up the image by the given factor.
    Uses LANCZOS for high-quality resampling.
    """
    width, height = img.size
    new_width = int(width * scale_factor)
    new_height = int(height * scale_factor)
    
    print(f"  Scaling from {width}x{height} to {new_width}x{new_height} ({scale_factor*100:.0f}%)")
    
    scaled = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
    return scaled

def apply_gray_background(img):
    """
    Ensure the background is the Mavala gray color.
    """
    # Create a gray background
    if img.mode == 'RGBA':
        background = Image.new('RGB', img.size, GREY_RGB)
        # Composite the image over gray background
        background.paste(img, (0, 0), img)
        return background
    else:
        return img

def process_image(input_path, output_path, scale_factor=1.35, badge_region=25, keep_margin=20):
    """
    Main processing function.
    """
    print(f"\n{'='*60}")
    print("Mavala Scientifique K+ Image Processor")
    print(f"{'='*60}")
    print(f"Input:  {input_path}")
    print(f"Output: {output_path}")
    print(f"Scale:  {scale_factor*100:.0f}%")
    print(f"{'='*60}\n")
    
    try:
        # Load image
        print("1. Loading image...")
        img = Image.open(input_path)
        print(f"   Original: {img.size[0]}x{img.size[1]} pixels, mode: {img.mode}")
        
        # Step 1: Remove badge from upper right
        print("\n2. Removing badge from upper right corner...")
        img = remove_badge_region(img, badge_region_percent=badge_region)
        
        # Step 2: Crop bottom whitespace
        print("\n3. Cropping bottom whitespace...")
        img = crop_bottom_whitespace(img, keep_margin=keep_margin)
        print(f"   After crop: {img.size[0]}x{img.size[1]} pixels")
        
        # Step 3: Scale up by 35%
        print("\n4. Scaling up bottle...")
        img = scale_image(img, scale_factor=scale_factor)
        print(f"   Final size: {img.size[0]}x{img.size[1]} pixels")
        
        # Step 4: Apply gray background
        print("\n5. Applying gray background...")
        img = apply_gray_background(img)
        
        # Save result
        print("\n6. Saving processed image...")
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        img.save(output_path, 'PNG', optimize=True)
        
        print(f"\n{'='*60}")
        print(f"Success! Saved to: {output_path}")
        print(f"{'='*60}\n")
        
        return True
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    parser = argparse.ArgumentParser(
        description='Process Mavala Scientifique K+ image: crop, remove badge, scale up',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument(
        '--input',
        default='public/images/mavala-scientifique-k/03.png',
        help='Input image path (default: public/images/mavala-scientifique-k/03.png)'
    )
    parser.add_argument(
        '--output',
        default='public/images/mavala-scientifique-k/03.png',
        help='Output image path (default: overwrites input)'
    )
    parser.add_argument(
        '--scale',
        type=float,
        default=1.35,
        help='Scale factor (default: 1.35 for 35%% increase)'
    )
    parser.add_argument(
        '--badge-region',
        type=int,
        default=25,
        help='Badge region size as percentage of width/height (default: 25)'
    )
    parser.add_argument(
        '--keep-margin',
        type=int,
        default=20,
        help='Margin to keep after cropping bottom (default: 20 pixels)'
    )
    parser.add_argument(
        '--backup',
        action='store_true',
        help='Create backup of original file before processing'
    )
    
    args = parser.parse_args()
    
    input_path = Path(args.input)
    output_path = Path(args.output)
    
    if not input_path.exists():
        print(f"Error: Input file not found: {input_path}")
        return 1
    
    # Create backup if requested
    if args.backup and input_path == output_path:
        backup_path = input_path.with_suffix('.png.backup')
        print(f"Creating backup: {backup_path}")
        import shutil
        shutil.copy2(input_path, backup_path)
    
    # Process the image
    success = process_image(
        input_path,
        output_path,
        scale_factor=args.scale,
        badge_region=args.badge_region,
        keep_margin=args.keep_margin
    )
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
