"""
Download Quiz Background Images from Mavala.fr Diagnostic Page
==============================================================

This script downloads the background images used in the diagnostic quiz
from https://www.mavala.fr/pages/diagnostic

INSTALLATION:
-------------
pip install requests

USAGE:
------
python scripts/download_images.py

The script will:
1. Create public/quiz folder if it doesn't exist
2. Download 8 background images (one for each quiz step)
3. Save them as step1.jpg, step2.jpg, etc.
"""

import os
import json
import requests
from pathlib import Path
from urllib.parse import urljoin, urlparse, parse_qs, urlencode, urlunparse

# Base URL for the diagnostic page
BASE_URL = "https://www.mavala.fr/pages/diagnostic"

# Quiz step image URLs
# NOTE: These URLs need to be extracted from the actual page.
# You can inspect the page source or use browser dev tools to find the exact image URLs.
# The images are typically background images for each quiz step:
# - Step 1: Welcome screen
# - Step 2: Gender selection
# - Step 3: Age selection
# - Step 4: Concerns selection
# - Step 5: Tightness question
# - Step 6: Sleep question
# - Step 7: Smoke question
# - Step 8: Makeup question
# - Step 9: Email collection

# TODO: Replace these placeholder URLs with the actual image URLs from the page
# You can find them by:
# 1. Opening https://www.mavala.fr/pages/diagnostic in a browser
# 2. Inspecting each quiz step's background image
# 3. Copying the image URLs and pasting them below

IMAGE_URLS = [
    # Step 1: Welcome
    "",  # Paste URL here
    # Step 2: Gender
    "",  # Paste URL here
    # Step 3: Age
    "",  # Paste URL here
    # Step 4: Concerns
    "",  # Paste URL here
    # Step 5: Tightness
    "",  # Paste URL here
    # Step 6: Sleep
    "",  # Paste URL here
    # Step 7: Smoke
    "",  # Paste URL here
    # Step 8: Makeup
    "",  # Paste URL here
    # Step 9: Email (if there's a background image)
    "",  # Paste URL here (optional)
]

def get_full_size_url(url: str) -> str:
    """Convert a Sanity CDN URL to full size by removing size constraints."""
    if not url:
        return url
    
    # For Sanity CDN URLs, remove size parameters to get full size
    if 'cdn.sanity.io' in url:
        parsed = urlparse(url)
        query_params = parse_qs(parsed.query)
        
        # Remove size constraints
        query_params.pop('w', None)
        query_params.pop('h', None)
        query_params.pop('fit', None)
        query_params.pop('crop', None)
        
        # Keep auto=format for optimization
        if 'auto' not in query_params:
            query_params['auto'] = ['format']
        
        # Rebuild URL
        new_query = urlencode(query_params, doseq=True)
        new_parsed = parsed._replace(query=new_query)
        return urlunparse(new_parsed)
    
    return url

def download_image(url: str, filepath: Path, step_num: int):
    """Download a single image from URL and save to filepath."""
    if not url or url.strip() == "":
        print(f"⚠️  Step {step_num}: No URL provided, skipping...")
        return False
    
    # Get full-size URL
    full_url = get_full_size_url(url)
    
    try:
        print(f"📥 Downloading step {step_num} image...")
        print(f"   Original: {url[:80]}...")
        print(f"   Full size: {full_url[:80]}...")
        
        response = requests.get(full_url, timeout=30, stream=True, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        response.raise_for_status()
        
        # Determine file extension from URL or Content-Type
        content_type = response.headers.get('Content-Type', '')
        if 'jpeg' in content_type or 'jpg' in content_type or url.lower().endswith(('.jpg', '.jpeg')):
            ext = '.jpg'
        elif 'png' in content_type or url.lower().endswith('.png'):
            ext = '.png'
        elif 'webp' in content_type or url.lower().endswith('.webp'):
            ext = '.webp'
        else:
            ext = '.png'  # Default to png for Sanity images
        
        # Save with appropriate extension
        save_path = filepath.parent / f"step{step_num}{ext}"
        
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        file_size = save_path.stat().st_size
        print(f"✅ Step {step_num}: Saved to {save_path.name} ({file_size:,} bytes)")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Step {step_num}: Failed to download - {e}")
        return False
    except Exception as e:
        print(f"❌ Step {step_num}: Error saving file - {e}")
        return False

def main():
    """Main function to download all quiz images."""
    # Get the project root (parent of scripts folder)
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # Try to load URLs from JSON file
    urls_file = script_dir / "quiz_image_urls.json"
    loaded_urls = []
    
    if urls_file.exists():
        try:
            with open(urls_file, 'r', encoding='utf-8') as f:
                loaded_urls = json.load(f)
            print(f"✅ Loaded {len(loaded_urls)} URLs from {urls_file.name}")
        except Exception as e:
            print(f"⚠️  Could not load URLs from JSON: {e}")
    
    # Use loaded URLs if available, otherwise use IMAGE_URLS
    urls_to_download = loaded_urls if loaded_urls else IMAGE_URLS
    
    # Create public/quiz directory
    quiz_dir = project_root / "mavala-hydrogen" / "public" / "quiz"
    quiz_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"📁 Quiz images will be saved to: {quiz_dir}")
    print(f"🔗 Base URL: {BASE_URL}\n")
    
    # Check if URLs are provided
    if not any(urls_to_download):
        print("⚠️  WARNING: No image URLs provided!")
        print("\n📝 To get the image URLs:")
        print("   1. Open https://www.mavala.fr/pages/diagnostic in your browser")
        print("   2. Open Developer Tools (F12)")
        print("   3. Inspect each quiz step's background image")
        print("   4. Copy the image URLs and paste them in IMAGE_URLS list in this script")
        print("\n   The images are typically found in:")
        print("   - CSS background-image properties")
        print("   - <img> tags")
        print("   - Or as data attributes")
        return
    
    # Download each image
    success_count = 0
    for i, url in enumerate(urls_to_download, start=1):
        if url and url.strip():
            filepath = quiz_dir / f"step{i}.jpg"
            if download_image(url, filepath, i):
                success_count += 1
        else:
            print(f"⏭️  Step {i}: Skipped (no URL)")
    
    print(f"\n✨ Download complete! {success_count}/{len([u for u in urls_to_download if u])} images downloaded.")
    print(f"📂 Images saved to: {quiz_dir}")

if __name__ == "__main__":
    main()

