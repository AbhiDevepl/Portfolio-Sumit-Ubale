import json
import os
import tkinter as tk
from tkinter import scrolledtext

# ===== CONFIG =====
FILE_PATH = "new_portfolio.json"
CATEGORY_KEY = "pre-wedding-photos-and-videos"
START_ID = 11
# ==================

# ===== DARK THEME =====
BG_COLOR = "#121212"
CARD_COLOR = "#1e1e1e"
TEXT_COLOR = "#ffffff"
ACCENT_COLOR = "#00c853"
ERROR_COLOR = "#ff5252"
ENTRY_BG = "#1f1f1f"
# ======================

def detect_media_type(url):
    video_extensions = [".mp4", ".webm", ".mov"]
    return "video" if any(url.lower().endswith(ext) for ext in video_extensions) else "image"

def initialize_json():
    if not os.path.exists(FILE_PATH):
        data = {CATEGORY_KEY: []}
        with open(FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        return data

    try:
        with open(FILE_PATH, "r", encoding="utf-8") as f:
            content = f.read().strip()

            if not content:
                data = {CATEGORY_KEY: []}
                with open(FILE_PATH, "w", encoding="utf-8") as fw:
                    json.dump(data, fw, indent=2)
                return data

            return json.loads(content)

    except json.JSONDecodeError:
        data = {CATEGORY_KEY: []}
        with open(FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        return data

def get_next_id(existing_items):
    if not existing_items:
        return START_ID
    return max(item.get("id", START_ID - 1) for item in existing_items) + 1

def refresh_preview():
    data = initialize_json()
    preview_text.delete("1.0", tk.END)
    preview_text.insert(tk.END, json.dumps(data, indent=2))

def save_url(url):
    if not url:
        status_label.config(text="Empty URL", fg=ERROR_COLOR)
        return

    data = initialize_json()

    if CATEGORY_KEY not in data:
        data[CATEGORY_KEY] = []

    existing_items = data[CATEGORY_KEY]
    new_id = get_next_id(existing_items)

    new_item = {
        "id": new_id,
        "title": "Pre-Wedding Session",
        "type": detect_media_type(url),
        "src": url,
        "alt": "Pre-Wedding photography captured by Sumit Ubale",
        "aspectRatio": "3/4"
    }

    existing_items.append(new_item)

    with open(FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    status_label.config(text=f"Saved (ID {new_id})", fg=ACCENT_COLOR)
    url_entry.delete(0, tk.END)
    refresh_preview()

def on_paste(event):
    root.after(50, process_paste)  # wait for paste to complete

def process_paste():
    url = url_entry.get().strip()
    save_url(url)

# ===== GUI =====
root = tk.Tk()
root.title("Auto Save JSON Tool")
root.geometry("750x550")
root.resizable(False, False)
root.configure(bg=BG_COLOR)

tk.Label(root, text="Paste URL (Auto Save):",
         bg=BG_COLOR, fg=TEXT_COLOR,
         font=("Arial", 12)).pack(pady=15)

url_entry = tk.Entry(root,
                     width=90,
                     bg=ENTRY_BG,
                     fg=TEXT_COLOR,
                     insertbackground=TEXT_COLOR,
                     relief="flat")
url_entry.pack(pady=5)

# Bind paste event
url_entry.bind("<Control-v>", on_paste)
url_entry.bind("<Button-3>", on_paste)  # right-click paste

status_label = tk.Label(root,
                        text="",
                        bg=BG_COLOR,
                        fg=TEXT_COLOR,
                        font=("Arial", 10))
status_label.pack(pady=5)

tk.Label(root,
         text="JSON Preview:",
         bg=BG_COLOR,
         fg=TEXT_COLOR,
         font=("Arial", 12)).pack(pady=10)

preview_text = scrolledtext.ScrolledText(root,
                                         width=95,
                                         height=22,
                                         bg=CARD_COLOR,
                                         fg=TEXT_COLOR,
                                         insertbackground=TEXT_COLOR,
                                         relief="flat")
preview_text.pack(pady=5)

refresh_preview()

root.mainloop()
