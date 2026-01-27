"""
Add grey background (#f5f5f5) to a single product image.
Replaces white/near-white pixels with grey.
"""
import sys
from pathlib import Path
from PIL import Image
import numpy as np

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Target grey color
GREY_RGB = (245, 245, 245)  # #f5f5f5

# White threshold - pixels with all RGB values above this are considered "white"
WHITE_THRESHOLD = 240

def replace_white_with_grey(image_path, output_path=None):
    """Replace white/near-white pixels with grey"""
    try:
        img = Image.open(image_path)
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Convert to numpy array for fast processing
        data = np.array(img)
        
        # Find white/near-white pixels (all RGB values > threshold)
        white_mask = (data[:, :, 0] > WHITE_THRESHOLD) & \
                     (data[:, :, 1] > WHITE_THRESHOLD) & \
                     (data[:, :, 2] > WHITE_THRESHOLD)
        
        # Replace white pixels with grey
        data[white_mask] = GREY_RGB
        
        # Create new image
        result = Image.fromarray(data)
        
        # Save to output path (or overwrite original)
        save_path = output_path or image_path
        
        # Save as PNG for best quality
        if str(save_path).lower().endswith('.jpg') or str(save_path).lower().endswith('.jpeg'):
            # Save as PNG with grey background
            png_path = str(save_path).rsplit('.', 1)[0] + '.png'
            result.save(png_path, 'PNG', optimize=True)
            print(f"   Saved as PNG: {png_path}")
            return png_path
        else:
            result.save(save_path, optimize=True)
            return save_path
        
    except Exception as e:
        print(f"   Error processing {image_path}: {e}")
        return None

def main():
    if len(sys.argv) < 2:
        print("Usage: python add_grey_background_single.py <image_path>")
        print("Example: python add_grey_background_single.py public/images/ridge-filler/Ridge+Filler+5ml.jpg")
        sys.exit(1)
    
    image_path = Path(sys.argv[1])
    
    if not image_path.exists():
        # Try relative to script location
        script_dir = Path(__file__).parent.parent
        image_path = script_dir / sys.argv[1]
    
    if not image_path.exists():
        print(f"Error: Image not found: {sys.argv[1]}")
        sys.exit(1)
    
    print(f"Processing: {image_path}")
    print(f"Target grey: #f5f5f5 (RGB {GREY_RGB})")
    
    result = replace_white_with_grey(image_path)
    
    if result:
        print(f"\n✓ Done! Grey background added.")
        print(f"  Output: {result}")
    else:
        print("\n✗ Failed to process image")
        sys.exit(1)

if __name__ == '__main__':
    main()
