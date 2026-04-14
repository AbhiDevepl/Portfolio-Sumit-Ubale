import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        try:
            # Check homepage
            print("Checking homepage...")
            await page.goto("http://localhost:8000/", timeout=10000)
            # Wait for gallery grid container, items might take time to load
            await page.wait_for_selector(".gallery-grid", timeout=10000)
            # Home page uses .gallery-item
            items = await page.query_selector_all(".gallery-grid .gallery-item")
            print(f"Homepage gallery items: {len(items)}")

            # Take screenshot
            await page.evaluate("window.scrollTo(0, 1000)")
            await asyncio.sleep(2)
            await page.screenshot(path="verification/homepage_gallery.png")

            # Check service page
            print("Checking service page (Weddings)...")
            await page.goto("http://localhost:8000/pages/service.html?service=weddings", timeout=10000)
            # Service page uses #service-gallery which gets .gallery-item injected
            await page.wait_for_selector("#service-gallery .gallery-item", timeout=10000)
            items = await page.query_selector_all("#service-gallery .gallery-item")
            print(f"Service page gallery items: {len(items)}")

            # Take screenshot
            await page.evaluate("window.scrollTo(0, 1000)")
            await asyncio.sleep(2)
            await page.screenshot(path="verification/service_gallery.png")

        except Exception as e:
            print(f"Error: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
