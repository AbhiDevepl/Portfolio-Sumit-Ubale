import os
import json
import re
from imagekitio import ImageKit

# =====================================================
# IMAGEKIT CONFIG
# =====================================================

imagekit = ImageKit(
    publicKey="public_DRIZXz6wGPOVKC1fmUr70QqmWk8=",
    privateKey="private_lSSugolsK4JzE4YH9y6ZlKZm/zI=",
    urlEndpoint="https://ik.imagekit.io/exdev"
)

# =====================================================
# CONFIGURATION
# =====================================================

IMAGE_DIR = os.path.join("assets", "images")
DATA_FILE = os.path.join("data", "portfolio.json")

CATEGORY_MAP = {
    "Wedding": "weddings",
    "Cinematic": "cinematics",
    "PrewedVideo": "pre-wedding",
    "BabyShower": "baby-shower",
    "Engagement": "engagement",
    "Haldi": "haldi",
    "Pre-Wedding": "pre-wedding",
    "Maternity": "maternity",
    "portraits": "portraits"
}

IGNORE_FOLDERS = ["about", "hero", "logos", "cover", "events"]

# =====================================================
# HELPERS
# =====================================================

def slugify(text: str) -> str:
    return re.sub(r"[\s_]+", "-", text.lower()).strip("-")


# =====================================================
# MAIN SYNC FUNCTION
# =====================================================

def sync_portfolio():

    if not os.path.exists(DATA_FILE):
        print(f"❌ Error: {DATA_FILE} not found.")
        return

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    new_images = {}

    categories = data["portfolio"]["categories"]
    category_slugs = [c["slug"] for c in categories]

    print("🔍 Scanning folders...\n")

    for root, dirs, files in os.walk(IMAGE_DIR):

        folder_name = os.path.basename(root)

        if folder_name == "images":
            continue

        if folder_name in IGNORE_FOLDERS:
            continue

        category_slug = CATEGORY_MAP.get(
            folder_name,
            slugify(folder_name)
        )

        # Add category if missing
        if category_slug not in category_slugs:
            print(f"➕ Adding category: {folder_name} ({category_slug})")

            data["portfolio"]["categories"].append({
                "id": category_slug,
                "name": folder_name.replace("-", " ").title(),
                "slug": category_slug
            })

            category_slugs.append(category_slug)

        if category_slug not in new_images:
            new_images[category_slug] = []

        for file in sorted(files):

            if not file.lower().endswith(
                (".webp", ".jpg", ".jpeg", ".png", ".mp4")
            ):
                continue

            is_video = file.lower().endswith(".mp4")

            file_path = f"/assets/images/{folder_name}/{file}"

            item = {
                "id": len(new_images[category_slug]) + 1,
                "title": f"{folder_name.title()} Session",
                "type": "video" if is_video else "image",
                "src": file_path,
                "alt": f"{folder_name} photography captured by Sumit Ubale",
                "aspectRatio": "16/9" if is_video else "3/4"
            }

            new_images[category_slug].append(item)

            print(f"✅ Added: {file}")

    # Update JSON
    data["portfolio"]["images"] = new_images

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    total = sum(len(v) for v in new_images.values())

    print("\n🎉 Sync Complete!")
    print(f"📸 {total} items across {len(new_images)} categories.")


# =====================================================
# RUN
# =====================================================

if __name__ == "__main__":
    sync_portfolio()