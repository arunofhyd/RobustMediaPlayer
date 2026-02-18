
from playwright.sync_api import sync_playwright

def verify_logo_rendering():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the index.html file directly
        import os
        cwd = os.getcwd()
        index_path = f'file://{cwd}/index.html'

        print(f'Loading {index_path}')
        page.goto(index_path)

        # Take a screenshot of the header area containing the logo
        # We target the header element
        header = page.locator('header')
        screenshot_path = 'verification/header_logo_verification.png'
        header.screenshot(path=screenshot_path)
        print(f'Screenshot saved to {screenshot_path}')

        browser.close()

if __name__ == '__main__':
    verify_logo_rendering()
