"""
Remove temp_ prefix from processed images
"""
from pathlib import Path
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def main():
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    images_base_dir = project_root / 'mavala-hydrogen' / 'public' / 'images'
    
    print("Removing temp_ prefix from processed images...")
    
    count = 0
    for folder in images_base_dir.iterdir():
        if folder.is_dir():
            for file in folder.iterdir():
                if file.is_file() and file.name.startswith('temp_'):
                    new_name = file.name.replace('temp_', '')
                    new_path = file.parent / new_name
                    file.rename(new_path)
                    print(f"✓ {folder.name}/{new_name}")
                    count += 1
    
    print(f"\n✅ Renamed {count} files")

if __name__ == '__main__':
    main()

