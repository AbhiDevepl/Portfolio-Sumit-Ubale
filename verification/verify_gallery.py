import asyncio
from playwright.async_api import async_playwright
import os

async def verify_gallery():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()

        # Start local server
        import subprocess
        server = subprocess.Popen(['python3', '-m', 'http.server', '8006'])

        try:
            await asyncio.sleep(2)  # Wait for server
            page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

            await page.goto("http://localhost:8006/")

            # 1. Verify Gallery Loading
            await page.wait_for_selector(".gallery-item")
            print("Gallery items loaded.")

            # 2. Trigger Lightbox
            first_item = page.locator(".gallery-item").first
            await first_item.click()

            # 3. Verify Lightbox visibility
            lightbox = page.locator("#lightbox")
            await lightbox.wait_for(state="visible")
            print("Lightbox is visible.")

            # 4. Take Screenshot
            await page.screenshot(path="/home/jules/verification/lightbox_verified.png")
            print("Screenshot saved to /home/jules/verification/lightbox_verified.png")

            # 5. Check if it still works after category filter
            await page.click(".lightbox-close")
            await page.click("button[data-category='weddings']")
            await asyncio.sleep(1) # Wait for GSAP

            # Click a wedding item
            wedding_item = page.locator(".gallery-item[data-category='weddings']").first
            await wedding_item.click()
            await lightbox.wait_for(state="visible")
            print("Lightbox opened after filtering.")

            await page.screenshot(path="/home/jules/verification/gallery_filtered_verified.png")

        finally:
            server.terminate()
            await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_gallery())
