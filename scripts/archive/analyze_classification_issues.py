"""
Analyze the color classification to see what went wrong
"""
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Load the classification results
with open('color_mapping_cream-colors.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("🔍 ANALYZING COLOR CLASSIFICATION ISSUES\n")
print("="*70)

# Show some examples from each category
for color, shades in data['color_groups'].items():
    print(f"\n{color.upper()} ({len(shades)} shades):")
    
    # Find the shade details for first 3 in this category
    for shade_name in shades[:3]:
        for detail in data['shade_details']:
            if detail['name'] == shade_name:
                rgb = detail['rgb']
                print(f"  • {shade_name:30} RGB({rgb[0]:3}, {rgb[1]:3}, {rgb[2]:3})")
                
                # Analyze the RGB values
                r, g, b = rgb
                if r > 200 and g > 200 and b > 200:
                    print(f"    ⚠️  Very light/white - might be reflection or glass")
                if r > 200 and g > 180 and b > 150:
                    print(f"    ⚠️  Beige/nude tones - could be bottle/glass color")
                if abs(r-g) < 30 and abs(g-b) < 30:
                    print(f"    ⚠️  Gray/neutral - might be picking up glass/reflection")
                break

print("\n" + "="*70)
print("\n💡 DIAGNOSIS:")
print("The algorithm is likely picking up:")
print("  1. Bottle glass reflections (very light colors)")
print("  2. Bottle material/cap color instead of polish")
print("  3. Background or highlights\n")

print("BETTER SOLUTIONS:")
print("  1. Crop to specific region of bottle (middle section only)")
print("  2. Use HSV color space instead of RGB")
print("  3. Filter out very light pixels (reflections)")
print("  4. Sample from multiple specific regions")
print("  5. Manual review/correction tool")
print("  6. Scrape actual color categories from Mavala website")







