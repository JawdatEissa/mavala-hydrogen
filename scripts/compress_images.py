#!/usr/bin/env python3
"""
Image compression script for bestseller product images
Reduces image quality to 85% for better performance
"""

from PIL import Image
import os
import shutil

def compress_image(image_path, quality=85):
    """
    Compress an image to the specified quality
    Creates a backup of the original file before compressing
    """
    print(f"\nProcessing: {image_path}")
    
    # Get file size before compression
    original_size = os.path.getsize(image_path)
    print(f"  Original size: {original_size / (1024 * 1024):.2f} MB")
    
    # Create backup
    backup_path = image_path + ".backup"
    if not os.path.exists(backup_path):
        shutil.copy2(image_path, backup_path)
        print(f"  Backup created: {backup_path}")
    
    # Open and compress image
    try:
        with Image.open(image_path) as img:
            # Convert RGBA to RGB if necessary (for JPG)
            if img.mode == 'RGBA' and image_path.lower().endswith('.jpg'):
                # Create a white background
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])  # 3 is the alpha channel
                img = background
            elif img.mode not in ('RGB', 'L'):
                img = img.convert('RGB')
            
            # Save with reduced quality
            img.save(image_path, quality=quality, optimize=True)
        
        # Get file size after compression
        new_size = os.path.getsize(image_path)
        reduction = ((original_size - new_size) / original_size) * 100
        print(f"  New size: {new_size / (1024 * 1024):.2f} MB")
        print(f"  Size reduction: {reduction:.1f}%")
        
        return True
    except Exception as e:
        print(f"  ERROR: {str(e)}")
        # Restore from backup if compression failed
        if os.path.exists(backup_path):
            shutil.copy2(backup_path, image_path)
            print(f"  Restored from backup")
        return False

def main():
    base_path = r"c:\Users\Incre\OneDrive\Desktop\courses\Mavala_Project\mavala-hydrogen\public\images"
    
    # List of images to compress (path relative to base_path)
    images_to_compress = [
        # mavala-stop
        "mavala-stop/02.jpg",
        "mavala-stop/03.jpg",
        
        # mavala-scientifique-k
        "mavala-scientifique-k/02.jpg",
        "mavala-scientifique-k/03.jpg",
        
        # nailactan-1
        "nailactan-1/02.jpg",
        "nailactan-1/03.jpg",
        
        # nail-white-crayon
        "nail-white-crayon/02.jpg",
        
        # double-lash (borderline files, optional)
        # Uncomment if you want to compress these too
        # "double-lash/02_Packaging.png",
        # "double-lash/03_Double-Lash+with+cottons.png",
        # "double-lash/04_Double-Lash+with+tea.png",
    ]
    
    print("=" * 60)
    print("Image Compression Script - Quality: 85%")
    print("=" * 60)
    
    success_count = 0
    fail_count = 0
    
    for image_rel_path in images_to_compress:
        image_path = os.path.join(base_path, image_rel_path)
        
        if not os.path.exists(image_path):
            print(f"\nWARNING: File not found: {image_path}")
            fail_count += 1
            continue
        
        if compress_image(image_path, quality=85):
            success_count += 1
        else:
            fail_count += 1
    
    print("\n" + "=" * 60)
    print(f"Compression complete!")
    print(f"  Success: {success_count} images")
    print(f"  Failed: {fail_count} images")
    print("=" * 60)
    print("\nNote: Backup files (.backup) have been created.")
    print("If you're satisfied with the results, you can delete the backup files.")

if __name__ == "__main__":
    main()
