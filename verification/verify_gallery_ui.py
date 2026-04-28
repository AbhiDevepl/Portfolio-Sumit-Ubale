import sys
from playwright.sync_api import sync_playwright

def test_gallery():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            page.goto("http://localhost:8000/pages/gallery.html?category=all")
            page.wait_for_selector("#page-loader", state="hidden", timeout=10000)

            # Wait for GSAP animations
            page.wait_for_timeout(2000)

            items = page.query_selector_all(".gallery-item")
            print(f"Found {len(items)} gallery items")

            if len(items) == 0:
                print("FAIL: No gallery items found")
                sys.exit(1)

            # Test filtering
            page.click("button.category-btn") # Click first category btn
            page.wait_for_timeout(1000)

            visible_items = page.query_selector_all(".gallery-item:not(.is-hidden)")
            print(f"Visible items after filtering: {len(visible_items)}")

            # Take screenshot
            page.screenshot(path="verification/gallery_verified.png")
            print("Screenshot saved to verification/gallery_verified.png")

        except Exception as e:
            print(f"Error: {e}")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    test_gallery()
