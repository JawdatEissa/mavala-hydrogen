"""
Script to process mavala_scientifique.jpg:
- Replace white background with grey (#f5f5f5)
- Save as PNG to public folder
"""

from PIL import Image
import os

# Paths
input_path = r"C:\Users\Incre\OneDrive\Desktop\courses\Mavala_Project\mavala-hydrogen\scientifique_k+.jpg"
output_path = r"C:\Users\Incre\OneDrive\Desktop\courses\Mavala_Project\mavala-hydrogen\public\bestseller-k-plus.png"

# Grey background color (same as the store uses)
GREY_BG = (245, 245, 245)  # #f5f5f5

# White threshold - pixels close to white will be replaced
WHITE_THRESHOLD = 240

def replace_white_with_grey(image_path, output_path):
    """Replace white/near-white background with grey"""
    print(f"Processing: {image_path}")
    
    # Open image
    img = Image.open(image_path)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Get pixel data
    pixels = img.load()
    width, height = img.size
    
    print(f"Image size: {width}x{height}")
    
    replaced_count = 0
    
    # Replace white pixels with grey
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Check if pixel is white/near-white
            if r >= WHITE_THRESHOLD and g >= WHITE_THRESHOLD and b >= WHITE_THRESHOLD:
                # Replace with grey
                pixels[x, y] = (GREY_BG[0], GREY_BG[1], GREY_BG[2], a)
                replaced_count += 1
    
    print(f"Replaced {replaced_count} pixels ({replaced_count * 100 / (width * height):.1f}%)")
    
    # Save as PNG
    img.save(output_path, 'PNG', optimize=True)
    print(f"Saved to: {output_path}")

if __name__ == "__main__":
    if not os.path.exists(input_path):
        print(f"Error: Input file not found: {input_path}")
    else:
        replace_white_with_grey(input_path, output_path)
        print("\nDone! Now update _index.tsx to use '/bestseller-k-plus-new.png'")

