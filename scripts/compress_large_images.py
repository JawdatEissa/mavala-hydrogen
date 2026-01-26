"""
High-Quality Image Compression Script
Compresses images larger than 1 MB while maintaining visual quality
"""

import os
import sys
from pathlib import Path
from PIL import Image
import argparse

def get_size_mb(file_path):
    """Get file size in MB"""
    return os.path.getsize(file_path) / (1024 * 1024)

def compress_image(input_path, output_path=None, quality=85, max_dimension=2000):
    """
    Compress image with high quality settings
    
    Args:
        input_path: Path to input image
        output_path: Path to output (None = overwrite)
        quality: JPEG quality (1-100, higher is better)
        max_dimension: Maximum width or height in pixels
    """
    try:
        img = Image.open(input_path)
        original_size = get_size_mb(input_path)
        
        # Convert RGBA to RGB if saving as JPEG
        if img.mode == 'RGBA':
            # Create white background
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])  # Use alpha channel as mask
            img = background
        elif img.mode not in ('RGB', 'L'):
            img = img.convert('RGB')
        
        # Resize if image is too large
        width, height = img.size
        if width > max_dimension or height > max_dimension:
            if width > height:
                new_width = max_dimension
                new_height = int((max_dimension / width) * height)
            else:
                new_height = max_dimension
                new_width = int((max_dimension / height) * width)
            
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            resized = True
        else:
            resized = False
        
        # Determine output path and format
        if output_path is None:
            output_path = input_path
        
        # Save with optimization
        save_kwargs = {
            'optimize': True,
        }
        
        # Use JPEG for photos (better compression)
        if Path(output_path).suffix.lower() in ['.jpg', '.jpeg']:
            save_kwargs['quality'] = quality
            save_kwargs['progressive'] = True
        elif Path(output_path).suffix.lower() == '.png':
            # For PNG, optimize but keep quality
            save_kwargs['compress_level'] = 9
        
        img.save(output_path, **save_kwargs)
        
        new_size = get_size_mb(output_path)
        savings = original_size - new_size
        savings_pct = (savings / original_size) * 100 if original_size > 0 else 0
        
        return {
            'success': True,
            'original_size': original_size,
            'new_size': new_size,
            'savings': savings,
            'savings_pct': savings_pct,
            'resized': resized
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def find_large_images(directory, min_size_mb=1.0):
    """Find all images larger than min_size_mb"""
    large_images = []
    extensions = ('.jpg', '.jpeg', '.png', '.webp')
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(extensions):
                file_path = os.path.join(root, file)
                size_mb = get_size_mb(file_path)
                if size_mb >= min_size_mb:
                    large_images.append({
                        'path': file_path,
                        'size': size_mb
                    })
    
    return sorted(large_images, key=lambda x: x['size'], reverse=True)

def main():
    parser = argparse.ArgumentParser(description='Compress large images while maintaining quality')
    parser.add_argument('directory', help='Directory to process')
    parser.add_argument('--min-size', type=float, default=1.0, help='Minimum size in MB to compress (default: 1.0)')
    parser.add_argument('--quality', type=int, default=85, help='JPEG quality 1-100 (default: 85, higher is better)')
    parser.add_argument('--max-dimension', type=int, default=2000, help='Maximum width/height in pixels (default: 2000)')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be compressed without doing it')
    
    args = parser.parse_args()
    
    print("\n" + "="*60)
    print("High-Quality Image Compression Tool")
    print("="*60)
    print(f"Directory: {args.directory}")
    print(f"Min size: {args.min_size} MB")
    print(f"Quality: {args.quality}%")
    print(f"Max dimension: {args.max_dimension}px")
    print(f"Mode: {'DRY RUN' if args.dry_run else 'COMPRESS'}")
    print("="*60)
    print()
    
    # Find large images
    large_images = find_large_images(args.directory, args.min_size)
    
    if not large_images:
        print(f"No images larger than {args.min_size} MB found.")
        return
    
    print(f"Found {len(large_images)} images larger than {args.min_size} MB")
    print()
    
    if args.dry_run:
        print("Images that would be compressed:")
        total_size = 0
        for img in large_images:
            print(f"  {img['size']:.2f} MB - {img['path']}")
            total_size += img['size']
        print(f"\nTotal size: {total_size:.2f} MB")
        print("\nRun without --dry-run to compress these images.")
        return
    
    # Process images
    total_original = 0
    total_new = 0
    success_count = 0
    fail_count = 0
    
    for i, img_info in enumerate(large_images, 1):
        path = img_info['path']
        rel_path = os.path.relpath(path, args.directory)
        
        print(f"[{i}/{len(large_images)}] Processing: {rel_path}")
        print(f"  Original: {img_info['size']:.2f} MB")
        
        result = compress_image(path, quality=args.quality, max_dimension=args.max_dimension)
        
        if result['success']:
            total_original += result['original_size']
            total_new += result['new_size']
            success_count += 1
            
            resize_msg = " (resized)" if result['resized'] else ""
            print(f"  Compressed: {result['new_size']:.2f} MB (saved {result['savings']:.2f} MB, {result['savings_pct']:.1f}%){resize_msg}")
            print(f"  [OK]")
        else:
            fail_count += 1
            print(f"  [FAILED] {result['error']}")
        
        print()
    
    # Summary
    print("="*60)
    print("COMPRESSION COMPLETE")
    print("="*60)
    print(f"Processed: {success_count} images")
    print(f"Failed: {fail_count} images")
    print(f"Original size: {total_original:.2f} MB")
    print(f"New size: {total_new:.2f} MB")
    print(f"Total saved: {total_original - total_new:.2f} MB ({((total_original - total_new) / total_original * 100):.1f}%)")
    print("="*60)

if __name__ == '__main__':
    main()

