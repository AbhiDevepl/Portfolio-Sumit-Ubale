import sys
from playwright.sync_api import sync_playwright

def test_portfolio():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            page.goto("http://localhost:8000/pages/portfolio.html")
            page.wait_for_selector(".gallery-grid", timeout=10000)

            # Wait for content to load
            page.wait_for_timeout(2000)

            items = page.query_selector_all(".gallery-item")
            print(f"Found {len(items)} portfolio gallery items")

            if len(items) == 0:
                print("FAIL: No portfolio items found")
                sys.exit(1)

            # Test filter click
            page.click(".filter-chip[data-category='weddings']")
            page.wait_for_timeout(1000)

            # Check if active class changed
            chip = page.query_selector(".filter-chip[data-category='weddings']")
            if "active" in chip.get_attribute("class"):
                print("SUCCESS: Filter chip active state updated")
            else:
                print("FAIL: Filter chip active state not updated")
                sys.exit(1)

        except Exception as e:
            print(f"Error: {e}")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    test_portfolio()
