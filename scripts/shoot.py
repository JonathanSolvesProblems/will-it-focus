"""Screenshot the app at the size judges see it (1280x720), idle and after a real question.

Usage: python scripts/shoot.py [base_url] [question]
Writes shots/idle-<theme>.png and shots/answer-<theme>.png.
"""

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3100"
QUESTION = sys.argv[2] if len(sys.argv) > 2 else None


def main() -> None:
    out = ROOT / "shots"
    out.mkdir(exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 720}, color_scheme="dark")
        page.goto(BASE)
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(1400)  # let the specimen quote resolve
        page.screenshot(path=out / "idle-dark.png")
        if QUESTION:
            page.fill("#q", QUESTION)
            page.click("button[type=submit]")
            page.wait_for_selector(".verdict, .error", timeout=300_000)
            page.wait_for_timeout(1200)
            page.screenshot(path=out / "answer-dark.png", full_page=True)
            page.click(".lcd button")
            page.wait_for_timeout(300)
            page.screenshot(path=out / "answer-light.png", full_page=True)
        browser.close()


if __name__ == "__main__":
    main()
