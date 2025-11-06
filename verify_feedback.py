import asyncio
import re
from pathlib import Path
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Get the absolute path to the HTML file
        file_path = Path(__file__).parent.resolve() / "index.html"
        await page.goto(f"file://{file_path}")

        # --- Test Spacebar (Play) ---
        await page.press("body", " ")
        await page.screenshot(path="feedback_play.png")
        await page.wait_for_timeout(1000)

        # --- Test Spacebar (Pause) ---
        await page.press("body", " ")
        await page.screenshot(path="feedback_pause.png")
        await page.wait_for_timeout(1000)

        # --- Test ArrowRight (Seek Forward) ---
        await page.press("body", "ArrowRight")
        await page.screenshot(path="feedback_seek_forward.png")
        await page.wait_for_timeout(1000)

        # --- Test ArrowLeft (Seek Backward) ---
        await page.press("body", "ArrowLeft")
        await page.screenshot(path="feedback_seek_backward.png")
        await page.wait_for_timeout(1000)

        # --- Test ArrowUp (Volume Up) ---
        await page.press("body", "ArrowUp")
        await page.screenshot(path="feedback_volume_up.png")
        await page.wait_for_timeout(1000)

        # --- Test ArrowDown (Volume Down) ---
        await page.press("body", "ArrowDown")
        await page.screenshot(path="feedback_volume_down.png")
        await page.wait_for_timeout(1000)

        # --- Test 'm' (Mute) ---
        await page.press("body", "m")
        await page.screenshot(path="feedback_mute.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
