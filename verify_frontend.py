import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Go to portfolio page
        await page.goto("http://localhost:8000/pages/portfolio.html")
        await page.wait_for_selector(".gallery-item")
        await page.screenshot(path="/home/jules/verification/gallery_loaded.png")

        # Click a filter
        await page.click("button[data-category='haldi']")
        await asyncio.sleep(1)
        await page.screenshot(path="/home/jules/verification/gallery_filtered.png")

        # Open lightbox
        await page.click(".gallery-item")
        await page.wait_for_selector("#lightbox.active")
        await page.screenshot(path="/home/jules/verification/gallery_lightbox.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
