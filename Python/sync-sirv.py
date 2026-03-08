import os
import json
import requests
import sys
import re
from dotenv import load_dotenv
from sirv_client import SirvClient, SirvError

# Load environment variables from .env
load_dotenv()

# =====================================================
# SIRV CONFIGURATION (loaded from .env)
# =====================================================
CLIENT_ID = os.getenv("SIRV_CLIENT_ID")
CLIENT_SECRET = os.getenv("SIRV_CLIENT_SECRET")
if not CLIENT_ID or not CLIENT_SECRET:
    print("❌ Missing SIRV_CLIENT_ID or SIRV_CLIENT_SECRET in .env")
    sys.exit(1)
BASE_URL = "https://api.sirv.com/v2"
SIRV_DOMAIN = "https://exdevx.sirv.com"

# =====================================================
# PATH CONFIGURATION
# =====================================================
DATA_FILE = "/home/devx/coding/Portfolio-Sumit-Ubale/data/portfolio.json"

# =====================================================
# CATEGORY → SIRV FOLDER MAP
# =====================================================
CATEGORY_FOLDERS = {
    "weddings": ["/Wedding"],
    "portraits": ["/Model"],
    "pre-wedding-photos-and-videos": ["/PreWedding", "/PerWedding"],
    "maternity": ["/Maternity"],
    "engagement": ["/Engagement"],
    "haldi": ["/Haldi"],
    "cinematics": ["/video"],
    "events": ["/Candid"],
    "kids": ["/Kids", "/Kide"]
}

# =====================================================
# HELPERS
# =====================================================

def natural_sort_key(filename):
    """
    Ensures numeric sorting:
    1.jpg 2.jpg 10.jpg 100.jpg
    """
    return [
        int(text) if text.isdigit() else text.lower()
        for text in re.split(r'(\d+)', filename)
    ]


def get_token():
    """Authenticate with Sirv and return token."""
    print("🔑 Authenticating with Sirv...")

    try:
        response = requests.post(
            f"{BASE_URL}/token",
            json={
                "clientId": CLIENT_ID,
                "clientSecret": CLIENT_SECRET
            }
        )

        response.raise_for_status()
        return response.json()["token"]

    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        sys.exit(1)


def get_sirv_files(client, folders):
    """
    Retrieve ALL files from Sirv folder (handles pagination).
    """

    for folder in folders:
        try:

            print(f"📁 Checking Sirv folder: {folder}")

            all_files = []
            continuation = None

            while True:

                if continuation:
                    response = client.readdir(folder, continuation=continuation)
                else:
                    response = client.readdir(folder)

                contents = response.get("contents", [])
                all_files.extend(contents)

                continuation = response.get("continuation")

                if not continuation:
                    break

            print(f"✅ Using folder {folder} ({len(all_files)} files)")
            return all_files, folder

        except SirvError:
            continue

    print(f"⚠️ Folder not found: {folders}")
    return [], folders[0]


# =====================================================
# MAIN SYNC
# =====================================================

def sync():

    token = get_token()
    client = SirvClient(bearer_token=token)

    if not os.path.exists(DATA_FILE):
        print(f"❌ JSON file not found: {DATA_FILE}")
        return

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    new_images = {}

    print("\n🚀 Starting Synchronization...\n")

    for slug, folders in CATEGORY_FOLDERS.items():

        files, actual_folder = get_sirv_files(client, folders)

        # Filter by extension: JPG/JPEG for most, plus video for cinematics
        allowed_exts = (".jpg", ".jpeg")
        if slug == "cinematics":
            allowed_exts = (".jpg", ".jpeg", ".mp4", ".mov")

        valid_files = [
            f for f in files
            if f["filename"].lower().endswith(allowed_exts)
        ]

        valid_files.sort(key=lambda x: natural_sort_key(x["filename"]))

        items = []

        for i, file in enumerate(valid_files, start=1):

            filename = file["filename"]
            is_video = filename.lower().endswith((".mp4", ".mov"))

            if is_video:
                src = f"{SIRV_DOMAIN}{actual_folder}/{filename}"
            else:
                src = f"{SIRV_DOMAIN}{actual_folder}/{filename}?w=800&q=80"

            title = slug.replace("-", " ").title()

            items.append({
                "id": i,
                "title": f"{title} Session",
                "type": "video" if is_video else "image",
                "src": src,
                "alt": f"{title} photography captured by Sumit Ubale",
                "aspectRatio": "16/9" if is_video else "3/4"
            })

        new_images[slug] = items

        print(f"📦 {slug}: {len(items)} items")

    data["portfolio"]["images"] = new_images

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    total = sum(len(v) for v in new_images.values())

    print("\n🎉 Sync Complete!")
    print(f"📊 Total media synced: {total}")
    print(f"📄 JSON Updated: {DATA_FILE}")


# =====================================================
# RUN
# =====================================================

if __name__ == "__main__":
    sync()