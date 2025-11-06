
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Construct the file path URI
        import os
        file_path = os.path.abspath('index.html')
        await page.goto(f'file://{file_path}')

        # It's better to use a local, reliable media file for testing
        await page.evaluate("""() => {
            const video = document.getElementById('videoPlayer');
            const source = document.createElement('source');
            source.src = 'https://www.w3schools.com/html/mov_bbb.mp4';
            source.type = 'video/mp4';
            video.appendChild(source);
            video.load();
        }""")

        # Allow some time for the video to potentially load, though we won't wait for it to play
        await asyncio.sleep(1)

        # Mute
        await page.keyboard.press('m')
        await asyncio.sleep(0.5) # wait for feedback to appear
        await page.screenshot(path='feedback_mute.png')

        # Unmute
        await page.keyboard.press('m')
        await asyncio.sleep(0.5)
        await page.screenshot(path='feedback_unmute.png')

        # Volume Up
        await page.keyboard.press('ArrowUp')
        await asyncio.sleep(0.5)
        await page.screenshot(path='feedback_volume_up.png')

        # Volume Down
        await page.keyboard.press('ArrowDown')
        await asyncio.sleep(0.5)
        await page.screenshot(path='feedback_volume_down.png')

        # Seek Forward
        await page.keyboard.press('ArrowRight')
        await asyncio.sleep(0.5)
        await page.screenshot(path='feedback_seek_forward.png')

        # Seek Backward
        await page.keyboard.press('ArrowLeft')
        await asyncio.sleep(0.5)
        await page.screenshot(path='feedback_seek_backward.png')

        # Fullscreen (note: actual fullscreen is hard to test in headless, but we can check the icon)
        await page.keyboard.press('f')
        await asyncio.sleep(0.5)
        await page.screenshot(path='feedback_fullscreen.png')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
