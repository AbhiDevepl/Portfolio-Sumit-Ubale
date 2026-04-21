
from playwright.sync_api import sync_playwright, expect
import time

def verify_gallery(page):
    print("Starting verification...")
    # 1. Go to homepage
    page.goto("http://localhost:8000")

    # Wait for loader to disappear
    print("Waiting for loader to hide...")
    page.wait_for_selector("#page-loader.hidden", timeout=15000)

    # GSAP animations might take some time
    print("Waiting for animations...")
    time.sleep(3)

    # Check if gallery items are present
    gallery_items = page.locator(".portfolio-item")
    count = gallery_items.count()
    print(f"Found {count} portfolio items on homepage.")

    # Take screenshot of homepage gallery
    page.screenshot(path="/home/jules/verification/homepage_gallery_final.png", full_page=True)

    # 2. Go to a service page
    print("Navigating to weddings service page...")
    page.goto("http://localhost:8000/pages/service.html?service=weddings")

    # Wait for service page content
    print("Waiting for service gallery...")
    page.wait_for_selector("#service-gallery .gallery-item", timeout=15000)

    # Wait for animations
    time.sleep(3)

    # Check count
    service_items = page.locator("#service-gallery .gallery-item")
    count = service_items.count()
    print(f"Found {count} items in wedding gallery.")

    # Take screenshot of service gallery
    page.screenshot(path="/home/jules/verification/service_gallery_final.png", full_page=True)
    print("Verification complete.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_gallery(page)
        except Exception as e:
            print(f"Verification failed: {e}")
        finally:
            browser.close()
