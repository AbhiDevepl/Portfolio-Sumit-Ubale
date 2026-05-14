import os
import asyncio
from playwright.async_api import async_playwright

async def verify_portfolio():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Start local server
        os.system("python3 -m http.server 8013 &")
        await asyncio.sleep(2)

        try:
            print("Navigating to portfolio page...")
            await page.goto("http://localhost:8013/pages/portfolio.html")

            # Wait for gallery to load
            print("Waiting for gallery items...")
            await page.wait_for_selector(".gallery-item", timeout=10000)

            items_count = await page.locator(".gallery-item").count()
            print(f"Found {items_count} gallery items on initial load.")
            assert items_count > 0, "Gallery should have items"

            # Test filtering
            print("Testing 'Weddings' filter...")
            weddings_chip = page.get_by_role("tab", name="Weddings")
            await weddings_chip.click()
            await asyncio.sleep(1) # Wait for filter

            visible_items = await page.locator(".gallery-item").count()
            print(f"Found {visible_items} items after filtering for Weddings.")
            assert visible_items > 0, "Weddings filter should show items"
            assert visible_items < items_count, "Filtering should reduce item count"

            # Test 'All' filter
            print("Testing 'All' filter...")
            all_chip = page.get_by_role("tab", name="All Work")
            await all_chip.click()
            await asyncio.sleep(1)
            all_items_count = await page.locator(".gallery-item").count()
            print(f"Found {all_items_count} items after returning to All.")
            assert all_items_count == items_count, "All filter should restore all items"

            # Test Lightbox
            print("Testing Lightbox...")
            await page.locator(".gallery-item").first.click(force=True)
            await page.wait_for_selector("#lightbox.active", timeout=5000)
            print("Lightbox opened successfully.")

            await page.screenshot(path="/home/jules/verification/screenshots/portfolio_final.png")
            print("Final screenshot saved.")

        finally:
            await browser.close()
            os.system("fuser -k 8013/tcp")

if __name__ == "__main__":
    asyncio.run(verify_portfolio())
