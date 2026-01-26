"""
Replace white backgrounds with grey (#f5f5f5) in product collection images.
This makes them look seamless on the grey container background.
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
        
        # Save as PNG to preserve quality
        if str(save_path).lower().endswith('.jpg') or str(save_path).lower().endswith('.jpeg'):
            save_path = str(save_path).rsplit('.', 1)[0] + '_grey.png'
            result.save(save_path, 'PNG')
        else:
            result.save(save_path)
        
        return save_path
        
    except Exception as e:
        print(f"   Error processing {image_path}: {e}")
        return None

def main():
    # Find all main product images (01_*.jpg files in collection folders)
    images_dir = Path(__file__).parent.parent / 'mavala-hydrogen' / 'public' / 'images'
    
    # Product collection folders to process (ones with white background collection shots)
    target_folders = [
        'pearl-colors',
        'sparkly-shades',
        'cream-colors',
        'blue-shades',
        'pink-shades',
        'red-shades',
        'green-shades',
        'purple-shades',
        'gold-shades',
        'grey-shades',
        'brown-shades',
        'nude-shades',
        'coral-shades',
        'white-shades',
        'yellow-shades',
        'orange-shades',
        'burgundy-shades',
        'black-shades',
        'blush-colors',
        'bio-colors',
    ]
    
    print("=" * 60)
    print("White to Grey Background Replacer")
    print(f"Target color: #f5f5f5 (RGB {GREY_RGB})")
    print("=" * 60)
    
    processed = 0
    
    for folder_name in target_folders:
        folder_path = images_dir / folder_name
        if not folder_path.exists():
            continue
        
        # Find the main collection image (usually 01_*.jpg)
        main_images = list(folder_path.glob('01_*.jpg')) + list(folder_path.glob('01_*.png'))
        
        for img_path in main_images:
            print(f"\n[PROCESSING] {folder_name}/{img_path.name}")
            result = replace_white_with_grey(img_path)
            if result:
                print(f"   [OK] Saved to: {Path(result).name}")
                processed += 1
    
    print("\n" + "=" * 60)
    print(f"Processed {processed} images")
    print("=" * 60)

if __name__ == '__main__':
    main()

