"""
Replace white backgrounds with grey (#f5f5f5) in ALL product images store-wide.
This processes every image in public/images/ to make them blend with the grey container.
"""
import sys
from pathlib import Path
from PIL import Image
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Target grey color
GREY_RGB = (245, 245, 245)  # #f5f5f5

# White threshold - pixels with all RGB values above this are considered "white"
WHITE_THRESHOLD = 240

# Skip these folders (already processed shade images with transparent backgrounds)
SKIP_FOLDERS = {'shades'}

# Only process these image extensions
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}

def has_white_background(img_path):
    """Check if image has significant white background"""
    try:
        img = Image.open(img_path).convert('RGB')
        data = np.array(img)
        
        # Count white pixels
        white_mask = (data[:,:,0] > WHITE_THRESHOLD) & \
                     (data[:,:,1] > WHITE_THRESHOLD) & \
                     (data[:,:,2] > WHITE_THRESHOLD)
        
        white_percentage = np.sum(white_mask) / (data.shape[0] * data.shape[1]) * 100
        
        # If more than 5% of image is white, it likely has a white background
        return white_percentage > 5
    except:
        return False

def replace_white_with_grey(img_path):
    """Replace white/near-white pixels with grey and save as PNG"""
    try:
        img = Image.open(img_path)
        
        # Convert to RGB if necessary (handle RGBA, P, etc.)
        if img.mode == 'RGBA':
            # For RGBA, only replace white pixels that are fully opaque
            data = np.array(img)
            white_mask = (data[:,:,0] > WHITE_THRESHOLD) & \
                         (data[:,:,1] > WHITE_THRESHOLD) & \
                         (data[:,:,2] > WHITE_THRESHOLD) & \
                         (data[:,:,3] > 250)  # Fully opaque
            data[white_mask, 0:3] = GREY_RGB
            result = Image.fromarray(data, 'RGBA')
        else:
            img = img.convert('RGB')
            data = np.array(img)
            
            # Find white/near-white pixels
            white_mask = (data[:,:,0] > WHITE_THRESHOLD) & \
                         (data[:,:,1] > WHITE_THRESHOLD) & \
                         (data[:,:,2] > WHITE_THRESHOLD)
            
            # Replace white pixels with grey
            data[white_mask] = GREY_RGB
            result = Image.fromarray(data)
        
        # Save as PNG with same base name
        output_path = img_path.parent / (img_path.stem + '.png')
        result.save(output_path, 'PNG', optimize=True)
        
        return str(img_path), str(output_path), True
        
    except Exception as e:
        return str(img_path), str(e), False

def process_folder(folder_path, processed_files):
    """Process all images in a folder"""
    results = []
    
    for img_path in folder_path.iterdir():
        if img_path.is_file() and img_path.suffix.lower() in IMAGE_EXTENSIONS:
            # Skip if we already have a PNG version
            png_path = img_path.parent / (img_path.stem + '.png')
            if img_path.suffix.lower() != '.png' and png_path.exists():
                continue
            
            # Skip if already processed
            if str(img_path) in processed_files:
                continue
            
            # Check if has white background worth replacing
            if has_white_background(img_path):
                results.append(img_path)
    
    return results

def main():
    images_dir = Path(__file__).parent.parent / 'mavala-hydrogen' / 'public' / 'images'
    
    if not images_dir.exists():
        print(f"Images directory not found: {images_dir}")
        return
    
    print("=" * 70)
    print("White to Grey Background Replacer - STORE WIDE")
    print(f"Target color: #f5f5f5 (RGB {GREY_RGB})")
    print(f"Processing: {images_dir}")
    print("=" * 70)
    
    # Find all folders to process
    all_folders = [f for f in images_dir.iterdir() if f.is_dir() and f.name not in SKIP_FOLDERS]
    
    print(f"\nFound {len(all_folders)} product folders to scan")
    print("Scanning for images with white backgrounds...\n")
    
    # Collect all images to process
    images_to_process = []
    processed_files = set()
    
    for folder in sorted(all_folders):
        folder_images = process_folder(folder, processed_files)
        if folder_images:
            images_to_process.extend(folder_images)
            print(f"  {folder.name}: {len(folder_images)} images to process")
    
    print(f"\nTotal images to process: {len(images_to_process)}")
    
    if not images_to_process:
        print("No images need processing!")
        return
    
    print("\nProcessing images...")
    print("-" * 70)
    
    # Process images
    success_count = 0
    fail_count = 0
    
    for i, img_path in enumerate(images_to_process, 1):
        src, result, success = replace_white_with_grey(img_path)
        
        if success:
            success_count += 1
            folder_name = Path(src).parent.name
            file_name = Path(result).name
            print(f"[{i}/{len(images_to_process)}] [OK] {folder_name}/{file_name}")
        else:
            fail_count += 1
            print(f"[{i}/{len(images_to_process)}] [FAIL] {src}: {result}")
    
    print("\n" + "=" * 70)
    print("PROCESSING COMPLETE")
    print("=" * 70)
    print(f"Success: {success_count}")
    print(f"Failed: {fail_count}")
    print(f"Total: {len(images_to_process)}")

if __name__ == '__main__':
    main()

