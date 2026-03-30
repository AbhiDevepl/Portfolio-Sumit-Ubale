import asyncio
from playwright.async_api import async_playwright
import os

async def run_benchmark():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()

        # Start local server
        import subprocess
        # Use a random-ish port to avoid conflicts
        server = subprocess.Popen(['python3', '-m', 'http.server', '8005'])

        try:
            await asyncio.sleep(2)  # Wait for server
            page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

            await page.goto("http://localhost:8005/")

            # Wait for gallery to load
            await page.wait_for_selector(".gallery-item")

            print("--- Benchmarking getVisibleData ---")
            # Trigger lightbox to call getVisibleData
            await page.click(".gallery-item")

            # Wait a bit for console logs
            await asyncio.sleep(2)

        finally:
            server.terminate()
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run_benchmark())
