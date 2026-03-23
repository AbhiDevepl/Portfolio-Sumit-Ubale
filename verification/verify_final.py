import os
import time
from playwright.sync_api import sync_playwright

def verify_gallery():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Start local server
        import subprocess
        server = subprocess.Popen(["python3", "-m", "http.server", "8000"])
        time.sleep(2)

        try:
            page.goto("http://localhost:8000/pages/gallery.html")
            page.wait_for_selector(".gallery-item")

            # Take screenshot of the optimized gallery
            page.screenshot(path="verification/gallery_optimized.png", full_page=True)

            items = page.locator(".gallery-item").count()
            print(f"Items found: {items}")

        finally:
            server.terminate()
            browser.close()

if __name__ == "__main__":
    verify_gallery()
