import asyncio
from playwright.async_api import async_playwright
import time
import subprocess
import os
import signal

async def run_benchmark():
    # Ensure port 8000 is free
    try:
        subprocess.run(['fuser', '-k', '8000/tcp'], stderr=subprocess.DEVNULL)
    except:
        pass

    # Start the server
    server_process = subprocess.Popen(['python3', '-m', 'http.server', '8000'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)  # Wait for server to start

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()

            results = []
            page.on("console", lambda msg: results.append(msg.text) if "renderGallery" in msg.text else None)

            # Go to the page
            await page.goto('http://localhost:8000/pages/gallery.html?category=all')

            # Wait for data to be loaded and items rendered
            await page.wait_for_selector('.gallery-item')

            # Trigger a re-render by clicking 'Weddings' then 'All Work'
            await page.click("button.category-btn:has-text('Weddings')")
            await page.wait_for_timeout(1000)

            results.clear() # Clear initial logs
            await page.click("button.category-btn:has-text('All Work')")
            await page.wait_for_timeout(2000)

            print("Benchmark results:")
            print("\n".join(results))

            await browser.close()
    finally:
        os.kill(server_process.pid, signal.SIGTERM)

if __name__ == "__main__":
    asyncio.run(run_benchmark())
