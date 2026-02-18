
from playwright.sync_api import sync_playwright

def verify_logo_svg():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the SVG file directly
        # Note: We need to use absolute path
        import os
        cwd = os.getcwd()
        svg_path = f'file://{cwd}/assets/logo.svg'

        print(f'Loading {svg_path}')
        page.goto(svg_path)

        # Take a screenshot of the SVG
        screenshot_path = 'verification/logo_verification.png'
        page.screenshot(path=screenshot_path)
        print(f'Screenshot saved to {screenshot_path}')

        browser.close()

if __name__ == '__main__':
    verify_logo_svg()
