
from playwright.sync_api import sync_playwright, expect
import time

def verify_gallery(page):
    # 1. Go to homepage
    page.goto("http://localhost:8000")

    # Wait for loader to disappear
    page.wait_for_selector("#page-loader.hidden", timeout=10000)

    # Check if gallery items are present
    gallery_items = page.locator(".portfolio-item")
    expect(gallery_items).to_have_count(3, timeout=5000) # Initial load shows 3 images

    # Take screenshot of homepage gallery
    page.screenshot(path="/home/jules/verification/homepage_gallery.png")

    # 2. Go to a service page
    page.goto("http://localhost:8000/pages/service.html?service=weddings")

    # Wait for service page content
    page.wait_for_selector("#service-gallery .gallery-item", timeout=10000)

    # Take screenshot of service gallery
    page.screenshot(path="/home/jules/verification/service_gallery.png")

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
