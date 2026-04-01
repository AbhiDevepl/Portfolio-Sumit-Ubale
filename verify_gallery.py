import asyncio
from playwright.async_api import async_playwright
import time
import subprocess
import os
import signal

async def verify_gallery():
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

            # 1. Test "All" category rendering and item count
            await page.goto('http://localhost:8000/pages/gallery.html?category=all')
            await page.wait_for_selector('.gallery-item')

            items_all = await page.query_selector_all('.gallery-item')
            print(f"Items in 'All Work': {len(items_all)}")
            assert len(items_all) >= 1100, f"Expected > 1100 items, got {len(items_all)}"

            # 2. Test category filtering (e.g., Weddings)
            weddings_btn = await page.query_selector("button.category-btn:has-text('Weddings')")
            await weddings_btn.click()
            await page.wait_for_timeout(1000)

            items_weddings = await page.query_selector_all('.gallery-item')
            print(f"Items in 'Weddings': {len(items_weddings)}")
            assert len(items_weddings) > 0, "Weddings category should have items"

            # 3. Verify category label in overlay
            first_item_cat = await page.eval_on_selector('.gallery-item .gallery-category', 'el => el.textContent')
            print(f"First item category label: {first_item_cat}")
            assert first_item_cat == 'Weddings', f"Expected 'Weddings' label, got '{first_item_cat}'"

            # 4. Test Lightbox functionality
            await page.click('.gallery-item')
            await page.wait_for_selector('#lightbox.active', state='visible')
            print("Lightbox opened successfully")

            # Verify lightbox content
            lightbox_cat = await page.eval_on_selector('.lightbox-caption p', 'el => el.textContent')
            print(f"Lightbox caption category: {lightbox_cat}")
            assert lightbox_cat == 'Weddings', f"Expected 'Weddings' in lightbox, got '{lightbox_cat}'"

            # 5. Navigating lightbox
            await page.click('.lightbox-next')
            await page.wait_for_timeout(500)
            print("Lightbox next navigation successful")

            await browser.close()
            print("Verification passed!")
    except Exception as e:
        print(f"Verification failed: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
    finally:
        os.kill(server_process.pid, signal.SIGTERM)

if __name__ == "__main__":
    asyncio.run(verify_gallery())
