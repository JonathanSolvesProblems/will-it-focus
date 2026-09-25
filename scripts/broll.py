"""Record demo footage of the deployed app.

Each shot is its own clip, recorded at 1920x1080 in the design's dark theme from the live URL,
so the footage shows exactly what a judge opens. Clips land in broll/ as .webm, plus .mp4 when
ffmpeg is on the path. One shot (05-live) runs a real question through the agent, which is one
paid model call; every other shot uses saved answers and costs nothing.

Usage: python scripts/broll.py [base_url] [--skip-live]
"""

import shutil
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import Browser, Page, sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "broll"
BASE = next((a for a in sys.argv[1:] if a.startswith("http")), "https://will-it-focus.vercel.app")
SKIP_LIVE = "--skip-live" in sys.argv

DESKTOP = {"width": 1920, "height": 1080}
PHONE = {"width": 390, "height": 844}
LIVE_QUESTION = "Canon EOS Rebel SL1 with the EF-S 18-55 IS STM: does continuous AF work while recording video?"


def open_page(page: Page, path: str = "/") -> None:
    page.goto(BASE + path, wait_until="load")
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(400)


def scroll_through(page: Page, steps: int = 4, step_px: int = 560, pause_ms: int = 1600) -> None:
    for _ in range(steps):
        page.evaluate(f"window.scrollBy({{top: {step_px}, behavior: 'smooth'}})")
        page.wait_for_timeout(pause_ms)


def example(page: Page, index: int) -> None:
    page.locator(".example").nth(index).click()
    page.wait_for_selector(".verdict, .error", timeout=240_000)
    page.wait_for_timeout(1800)  # let the quotes resolve


def shot_home(page: Page) -> None:
    open_page(page)
    page.wait_for_timeout(2600)  # the specimen quote lines up at 700ms; hold on it
    page.locator(".example").first.hover()
    page.wait_for_timeout(1200)
    page.locator(".example").nth(1).hover()
    page.wait_for_timeout(2400)


def shot_t5i(page: Page) -> None:
    open_page(page)
    example(page, 0)
    page.wait_for_timeout(1500)
    scroll_through(page, steps=5)
    page.wait_for_timeout(1500)


def shot_sigma(page: Page) -> None:
    open_page(page)
    example(page, 1)
    page.wait_for_timeout(2500)
    scroll_through(page, steps=2)
    page.wait_for_timeout(2000)


def shot_refusal(page: Page) -> None:
    open_page(page)
    example(page, 3)
    page.wait_for_timeout(5000)


def shot_live(page: Page) -> None:
    open_page(page)
    box = page.locator("#q")
    box.click()
    box.press_sequentially(LIVE_QUESTION, delay=28)
    page.wait_for_timeout(600)
    box.press("Enter")
    page.wait_for_selector(".verdict, .error", timeout=240_000)
    page.wait_for_timeout(2500)
    scroll_through(page, steps=2)
    page.wait_for_timeout(2000)


def shot_light(page: Page) -> None:
    open_page(page)
    example(page, 1)
    page.wait_for_timeout(1200)
    page.locator(".lcd button").click()
    page.wait_for_timeout(3500)
    scroll_through(page, steps=2)
    page.wait_for_timeout(1500)


def shot_phone(page: Page) -> None:
    open_page(page)
    page.wait_for_timeout(2000)
    example(page, 0)
    page.wait_for_timeout(1500)
    scroll_through(page, steps=6, step_px=520, pause_ms=1300)
    page.wait_for_timeout(1200)


SHOTS = [
    ("01-home", shot_home, DESKTOP),
    ("02-saved-t5i", shot_t5i, DESKTOP),
    ("03-saved-sigma", shot_sigma, DESKTOP),
    ("04-refusal", shot_refusal, DESKTOP),
    ("05-live-question", shot_live, DESKTOP),
    ("06-light-theme", shot_light, DESKTOP),
    ("07-phone", shot_phone, PHONE),
]


def record(browser: Browser, name: str, action, size: dict) -> Path:
    tmp = OUT / ".tmp"
    tmp.mkdir(parents=True, exist_ok=True)
    context = browser.new_context(viewport=size, color_scheme="dark", record_video_dir=str(tmp), record_video_size=size)
    page = context.new_page()
    try:
        action(page)
    finally:
        video = page.video
        context.close()
    dest = OUT / f"{name}.webm"
    shutil.move(video.path(), dest)
    return dest


def to_mp4(webm: Path) -> None:
    if not shutil.which("ffmpeg"):
        return
    mp4 = webm.with_suffix(".mp4")
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(webm), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30", "-crf", "18", str(mp4)],
        check=True,
    )


def main() -> None:
    OUT.mkdir(exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name, action, size in SHOTS:
            if SKIP_LIVE and name.startswith("05"):
                print(f"skip {name}")
                continue
            clip = record(browser, name, action, size)
            to_mp4(clip)
            print(f"{clip.name}  {clip.stat().st_size // 1024} KB")
        browser.close()
    shutil.rmtree(OUT / ".tmp", ignore_errors=True)


if __name__ == "__main__":
    main()
