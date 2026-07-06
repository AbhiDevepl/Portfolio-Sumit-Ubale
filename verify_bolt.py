import os
import time
import subprocess
from playwright.sync_api import sync_playwright

def run_test():
    # Start a local server
    server_process = subprocess.Popen(['python3', '-m', 'http.server', '8001'])
    time.sleep(2)  # Wait for server to start

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            # Go to the local server
            page.goto('http://localhost:8001')

            # 1. Check if initial items are loaded (All category)
            # By default it loads 3 items
            page.wait_for_selector('.portfolio-item')
            items = page.query_selector_all('.portfolio-item')
            print(f"Initial items (All): {len(items)}")

            # 2. Test filtering (Weddings)
            page.click('button[data-category="weddings"]')
            time.sleep(1) # wait for animation
            wedding_items = page.query_selector_all('.portfolio-item')
            print(f"Wedding items: {len(wedding_items)}")

            # 3. Test Load More
            if page.is_visible('#inline-load-more-btn'):
                page.click('#inline-load-more-btn')
                time.sleep(1)
                more_items = page.query_selector_all('.portfolio-item')
                print(f"Items after Load More: {len(more_items)}")

            # Take a screenshot for visual verification
            page.screenshot(path='verification_homepage.png')
            print("Screenshot saved to verification_homepage.png")

            browser.close()
    finally:
        server_process.terminate()

if __name__ == "__main__":
    run_test()
