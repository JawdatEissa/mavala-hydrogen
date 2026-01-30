"""
Generate blog data JSON for the Mavala Hydrogen app
"""

import json
import os
from pathlib import Path

# Paths
scraped_dir = Path(__file__).parent.parent.parent / 'scraped_data' / 'blogs_v2'
output_file = Path(__file__).parent.parent / 'app' / 'data' / 'blogs.json'

# Ensure output directory exists
output_file.parent.mkdir(parents=True, exist_ok=True)

# Load all blog JSON files
blogs = []
for json_file in scraped_dir.glob('*.json'):
    if json_file.name == 'all_blogs_combined.json':
        continue
    
    with open(json_file, 'r', encoding='utf-8') as f:
        blog = json.load(f)
        blogs.append(blog)

# Sort by date (newest first)
blogs.sort(key=lambda x: x.get('metadata', {}).get('date_iso', ''), reverse=True)

# Create output data
output_data = {
    'total_blogs': len(blogs),
    'blogs': blogs
}

# Write to output file
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)

print(f'Created blogs.json with {len(blogs)} blogs')
for blog in blogs:
    slug = blog["slug"]
    title = blog["metadata"]["title"][:50]
    print(f'  - {slug}: {title}...')
