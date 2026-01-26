"""
Extract Quiz Image URLs from Typeform Diagnostic Quiz
====================================================

This script uses Playwright to navigate through the Typeform quiz
and extract all background image URLs from each step.

INSTALLATION:
-------------
pip install playwright
playwright install chromium

USAGE:
------
python scripts/extract_quiz_images.py

The script will:
1. Open the diagnostic page
2. Navigate through each quiz step
3. Extract background image URLs
4. Save the URLs to a file for use in download_images.py
"""

import json
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

def extract_image_urls():
    """Extract image URLs from the Typeform quiz."""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    print("🚀 Starting image extraction from Typeform quiz...")
    print("📝 Note: This script will navigate through the quiz automatically\n")
    
    image_urls = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Show browser so you can see progress
        page = browser.new_page()
        
        try:
            # Navigate to the diagnostic page
            print("🌐 Opening diagnostic page...")
            page.goto("https://www.mavala.fr/pages/diagnostic", wait_until="networkidle")
            time.sleep(3)  # Wait for page to fully load
            
            # Wait for Typeform to load
            print("⏳ Waiting for Typeform to load...")
            page.wait_for_selector('[data-tf-widget]', timeout=10000)
            time.sleep(2)
            
            # Click "Commencer" button to start the quiz
            print("🖱️  Clicking 'Commencer' to start quiz...")
            try:
                page.click('text=Commencer', timeout=5000)
                time.sleep(2)
            except:
                print("   (Start button might not be needed)")
            
            # Extract images from each step
            # Typeform loads steps dynamically, so we need to wait and extract as we go
            print("\n📸 Extracting images from quiz steps...")
            
            for step in range(1, 10):  # 9 questions total
                print(f"\n   Step {step}:")
                time.sleep(2)  # Wait for step to load
                
                # Try multiple methods to find background images
                image_url = None
                
                # Method 1: Check for background-image in CSS
                try:
                    # Look for elements with background images
                    bg_elements = page.query_selector_all('[style*="background-image"]')
                    for elem in bg_elements:
                        style = elem.get_attribute('style')
                        if 'url(' in style:
                            # Extract URL from background-image: url(...)
                            import re
                            match = re.search(r'url\(["\']?([^"\']+)["\']?\)', style)
                            if match:
                                image_url = match.group(1)
                                if image_url.startswith('//'):
                                    image_url = 'https:' + image_url
                                elif image_url.startswith('/'):
                                    image_url = 'https://www.mavala.fr' + image_url
                                break
                except Exception as e:
                    print(f"      Method 1 failed: {e}")
                
                # Method 2: Check for <img> tags
                if not image_url:
                    try:
                        img_elements = page.query_selector_all('img[src*="typeform"], img[src*="image"]')
                        for img in img_elements:
                            src = img.get_attribute('src')
                            if src and ('typeform' in src.lower() or 'image' in src.lower()):
                                image_url = src
                                if image_url.startswith('//'):
                                    image_url = 'https:' + image_url
                                break
                    except Exception as e:
                        print(f"      Method 2 failed: {e}")
                
                # Method 3: Check computed styles
                if not image_url:
                    try:
                        # Find the main quiz container
                        quiz_container = page.query_selector('[data-tf-widget]') or page.query_selector('iframe')
                        if quiz_container:
                            # Try to get background from computed styles
                            bg_image = page.evaluate('''() => {
                                const elem = document.querySelector('[data-tf-widget]') || document.querySelector('iframe');
                                if (elem) {
                                    const style = window.getComputedStyle(elem);
                                    return style.backgroundImage;
                                }
                                return null;
                            }''')
                            if bg_image and 'url(' in bg_image:
                                import re
                                match = re.search(r'url\(["\']?([^"\']+)["\']?\)', bg_image)
                                if match:
                                    image_url = match.group(1)
                    except Exception as e:
                        print(f"      Method 3 failed: {e}")
                
                if image_url:
                    print(f"      ✅ Found: {image_url}")
                    image_urls.append(image_url)
                else:
                    print(f"      ⚠️  No image found for this step")
                    image_urls.append("")  # Placeholder
                
                # Try to proceed to next step (click next button if available)
                if step < 9:
                    try:
                        # Look for next/submit buttons
                        next_button = page.query_selector('button[type="submit"], button:has-text("Suivant"), button:has-text("Next")')
                        if next_button:
                            next_button.click()
                            time.sleep(1)
                    except:
                        pass  # Continue anyway
            
            browser.close()
            
        except Exception as e:
            print(f"\n❌ Error during extraction: {e}")
            browser.close()
            return
    
    # Save URLs to a JSON file
    urls_file = project_root / "scripts" / "quiz_image_urls.json"
    with open(urls_file, 'w', encoding='utf-8') as f:
        json.dump(image_urls, f, indent=2)
    
    print(f"\n✨ Extraction complete!")
    print(f"📄 URLs saved to: {urls_file}")
    print(f"\n📋 Found {len([u for u in image_urls if u])} image URLs:")
    for i, url in enumerate(image_urls, 1):
        if url:
            print(f"   Step {i}: {url}")
    
    print(f"\n💡 Next step: Update download_images.py with these URLs")

if __name__ == "__main__":
    extract_image_urls()










