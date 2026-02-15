import os
import json
import re

# Configuration
IMAGE_DIR = os.path.join('assets', 'images')
DATA_FILE = os.path.join('data', 'portfolio.json')

# Configuration
IMAGE_DIR = os.path.join('assets', 'images')
DATA_FILE = os.path.join('data', 'portfolio.json')

# Map folder names to existing category slugs
CATEGORY_MAP = {
    'Wedding': 'weddings',
    'Cinematic': 'cinematics',
    'PrewedVideo': 'pre-wedding',
    'BabyShower': 'baby-shower',
    'Engagement': 'engagement',
    'Haldi': 'haldi',
    'Pre-Wedding': 'pre-wedding',
    'Maternity': 'maternity',
    'portraits': 'portraits'
}

def slugify(text):
    return re.sub(r'[\s_]+', '-', text.lower()).strip('-')

def sync_portfolio():
    if not os.path.exists(DATA_FILE):
        print(f"Error: {DATA_FILE} not found.")
        return

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Dictionary to hold the new image structure
    new_images = {}
    
    # Existing categories mapping
    categories = data['portfolio']['categories']
    
    # Clean up any previously auto-added duplicates from a bad run
    # (Optional: filter out IDs that was auto-created but we now map)
    # For simplicity, we just process and use CATEGORY_MAP
    
    category_slugs = [c['slug'] for c in categories]

    # Walk through the images directory
    for root, dirs, files in os.walk(IMAGE_DIR):
        folder_name = os.path.basename(root)
        if folder_name == 'images': continue
        if folder_name in ['about', 'hero', 'logos', 'cover', 'events']: continue 

        # Map folder name to category slug
        category_slug = CATEGORY_MAP.get(folder_name, slugify(folder_name))
        
        # If category doesn't exist, add it
        if category_slug not in category_slugs:
            print(f"Adding new category: {folder_name} ({category_slug})")
            data['portfolio']['categories'].append({
                "id": category_slug,
                "name": folder_name.replace('-', ' ').title(),
                "slug": category_slug
            })
            category_slugs.append(category_slug)

        if category_slug not in new_images:
            new_images[category_slug] = []

        for file in sorted(files):
            if file.lower().endswith(('.webp', '.jpg', '.jpeg', '.png', '.mp4')):
                is_video = file.lower().endswith('.mp4')
                file_path = f"/assets/images/{folder_name}/{file}"
                
                # Check if it already exists in data to preserve titles/descriptions if needed
                # For now, let's just recreate with fresh data
                item = {
                    "id": len(new_images[category_slug]) + 1,
                    "title": f"{folder_name.title()} Session",
                    "type": "video" if is_video else "image",
                    "src": file_path,
                    "alt": f"{folder_name} photography captured by Sumit Ubale",
                    "aspectRatio": "16/9" if is_video else "3/4"
                }
                new_images[category_slug].append(item)
        
    # Update the data object
    data['portfolio']['images'] = new_images

    # Save the updated JSON
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

    print(f"Successfully synced {sum(len(v) for v in new_images.values())} items across {len(new_images)} categories.")

if __name__ == "__main__":
    sync_portfolio()
