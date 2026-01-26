"""
Universal White Background Replacement Script
=============================================
Replaces white/near-white backgrounds with grey (#f5f5f5) in images.

Usage:
------
Single file:
    python scripts/replace_white_background.py input.jpg output.png

Batch (entire folder):
    python scripts/replace_white_background.py input_folder/ output_folder/

Options:
    --threshold N    : White threshold (0-255, default: 240). Higher = stricter white detection
    --grey "R,G,B"   : Custom grey color (default: "245,245,245" = #f5f5f5)
    --overwrite      : Overwrite input files (use with caution!)

Examples:
---------
# Process single image
python scripts/replace_white_background.py mavala-hydrogen/image.jpg mavala-hydrogen/public/image.png

# Process with custom threshold (more aggressive white detection)
python scripts/replace_white_background.py image.jpg output.png --threshold 230

# Process entire folder
python scripts/replace_white_background.py images_raw/ images_processed/

# Overwrite original files
python scripts/replace_white_background.py mavala-hydrogen/public/images/product/ --overwrite
"""

import sys
import os
import argparse
from pathlib import Path
from PIL import Image

# Default settings
DEFAULT_THRESHOLD = 240  # Pixels with R,G,B all >= this value are considered white
DEFAULT_GREY = (245, 245, 245)  # #f5f5f5 - Mavala store grey background

def replace_white_with_grey(image_path: str, output_path: str, threshold: int = DEFAULT_THRESHOLD, grey_color: tuple = DEFAULT_GREY) -> bool:
    """
    Replace white/near-white background pixels with grey.
    
    Args:
        image_path: Path to input image
        output_path: Path to save processed image (always saves as PNG)
        threshold: White detection threshold (0-255)
        grey_color: RGB tuple for replacement color
    
    Returns:
        True if successful, False otherwise
    """
    try:
        print(f"  Processing: {image_path}")
        
        # Open image
        img = Image.open(image_path)
        
        # Convert to RGBA if not already
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Get pixel data
        pixels = img.load()
        width, height = img.size
        
        replaced_count = 0
        
        # Replace white pixels with grey
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                
                # Check if pixel is white/near-white
                if r >= threshold and g >= threshold and b >= threshold:
                    pixels[x, y] = (grey_color[0], grey_color[1], grey_color[2], a)
                    replaced_count += 1
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
        
        # Save as PNG (preserves transparency)
        img.save(output_path, 'PNG', optimize=True)
        
        percentage = replaced_count * 100 / (width * height)
        print(f"  [OK] Saved: {output_path} ({percentage:.1f}% pixels replaced)")
        return True
        
    except Exception as e:
        print(f"  [ERROR] {e}")
        return False

def process_directory(input_dir: str, output_dir: str, threshold: int, grey_color: tuple, overwrite: bool = False) -> tuple:
    """
    Process all images in a directory.
    
    Returns:
        Tuple of (success_count, failure_count)
    """
    input_path = Path(input_dir)
    output_path = Path(output_dir) if not overwrite else input_path
    
    # Supported image extensions
    extensions = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'}
    
    # Find all images
    images = [f for f in input_path.rglob('*') if f.suffix.lower() in extensions]
    
    if not images:
        print(f"No images found in {input_dir}")
        return (0, 0)
    
    print(f"Found {len(images)} images to process")
    
    success = 0
    failure = 0
    
    for img_file in images:
        # Calculate relative path for output
        relative = img_file.relative_to(input_path)
        
        # Change extension to .png for output
        out_file = output_path / relative.with_suffix('.png')
        
        if replace_white_with_grey(str(img_file), str(out_file), threshold, grey_color):
            success += 1
        else:
            failure += 1
    
    return (success, failure)

def parse_grey_color(color_str: str) -> tuple:
    """Parse 'R,G,B' string to tuple."""
    try:
        parts = [int(x.strip()) for x in color_str.split(',')]
        if len(parts) != 3:
            raise ValueError("Must have exactly 3 values")
        return tuple(parts)
    except:
        print(f"Warning: Invalid grey color '{color_str}', using default")
        return DEFAULT_GREY

def main():
    parser = argparse.ArgumentParser(
        description='Replace white backgrounds with grey in images',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument('input', help='Input image file or directory')
    parser.add_argument('output', nargs='?', help='Output file or directory (optional with --overwrite)')
    parser.add_argument('--threshold', type=int, default=DEFAULT_THRESHOLD,
                        help=f'White threshold 0-255 (default: {DEFAULT_THRESHOLD})')
    parser.add_argument('--grey', default=f"{DEFAULT_GREY[0]},{DEFAULT_GREY[1]},{DEFAULT_GREY[2]}",
                        help=f'Grey color as R,G,B (default: {DEFAULT_GREY[0]},{DEFAULT_GREY[1]},{DEFAULT_GREY[2]})')
    parser.add_argument('--overwrite', action='store_true',
                        help='Overwrite input files (output arg not needed)')
    
    args = parser.parse_args()
    
    # Parse grey color
    grey_color = parse_grey_color(args.grey)
    
    # Validate arguments
    if not args.overwrite and not args.output:
        print("Error: Either provide output path or use --overwrite flag")
        sys.exit(1)
    
    input_path = Path(args.input)
    
    if not input_path.exists():
        print(f"Error: Input path not found: {args.input}")
        sys.exit(1)
    
    print(f"\n{'='*60}")
    print("White Background Replacement Tool")
    print(f"{'='*60}")
    print(f"Threshold: {args.threshold}")
    print(f"Grey color: RGB{grey_color} (#{grey_color[0]:02x}{grey_color[1]:02x}{grey_color[2]:02x})")
    print(f"{'='*60}\n")
    
    if input_path.is_file():
        # Single file
        output = args.input if args.overwrite else args.output
        # Ensure PNG extension
        if not output.lower().endswith('.png'):
            output = str(Path(output).with_suffix('.png'))
        
        success = replace_white_with_grey(args.input, output, args.threshold, grey_color)
        sys.exit(0 if success else 1)
    
    elif input_path.is_dir():
        # Directory
        output_dir = args.input if args.overwrite else args.output
        success, failure = process_directory(args.input, output_dir, args.threshold, grey_color, args.overwrite)
        
        print(f"\n{'='*60}")
        print(f"Complete! Success: {success}, Failed: {failure}")
        print(f"{'='*60}")
        
        sys.exit(0 if failure == 0 else 1)
    
    else:
        print(f"Error: {args.input} is neither a file nor directory")
        sys.exit(1)

if __name__ == "__main__":
    main()

