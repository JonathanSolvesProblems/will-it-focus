"""Gallery previews: up to 8 images at 3:2 in the demo video's order, one caption each, 140 max.

Two kinds of shot:
  page   the live site rendered at a 3:2 viewport, optionally after clicking an example
         question, scrolled so a CSS selector sits near the top
  frame  a frame from a raw b-roll recording (never the rendered video, so no burned-in
         captions), letterboxed to 3:2 in its own background colour

Output: preview/N-name.png plus preview/captions.md, one fenced block per image holding the
caption and nothing else. Caption lengths are asserted here and printed to the terminal only.

    python scripts/preview.py
"""

import subprocess
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent

# ------------------------------------------------------------------ CONFIG
OUT = ROOT / "preview"
URL = "https://will-it-focus.vercel.app"
W, H = 1440, 960  # 3:2; the app's column is 1080 wide, so this leaves the surround visible without emptiness
BROLL = ROOT / "broll"

# story order = the demo video's order. (name, kind, source, action)
#   page:  source is a selector to scroll near the top, action is an example chip index to click first (or None)
#   frame: source is the raw clip stem, action is the second to take the frame at
SHOTS = [
    ("1-hero", "page", None, None),
    ("2-manual", "frame", "08-manual", 14.0),
    ("3-t5i-answer", "page", ".headline", 0),
    ("4-two-endpoints", "frame", "09-context", 24.5),
    ("5-measured", "frame", "13-eval", 27.5),
    ("6-live", "frame", "05-live-question", 19.5),
    ("7-refusal", "page", ".headline", 3),
    ("8-checks", "frame", "14-scripts", 11.0),
]

CAPTIONS = {
    "1-hero": "Will It Focus: whether a camera body, lens and adapter autofocus together, answered from the manufacturers' own documents.",
    "2-manual": "Canon's own manual, page 100: in the auto modes the camera focuses the closest subject, not yours. Highlighted as the video reads it.",
    "3-t5i-answer": "The T5i answer, split by shooting mode. Each quote lines up only because it matches its Sanity record word for word.",
    "4-two-endpoints": "Two Sanity Context endpoints: 131 typed documents over GROQ for verdicts, a Knowledge Base for the why. Each record keeps quote and page.",
    "5-measured": "20 questions graded by Sigma's, Canon's and Metabones' own tables. With typed records, 21 of 22 quotes are the manufacturer's words.",
    "6-live": "A live question, typed and answered through Sanity Context. The verdict cites Canon's compatibility note, checked word for word.",
    "7-refusal": "A Nikon lens on a Canon body through a third-party adapter: no manufacturer record covers it, so there is no verdict. It does not guess.",
    "8-checks": "Two scripts fail the build if the words and the data disagree: 137 quotes checked against the PDFs, 0 failures. 0 claim failures.",
}
# ------------------------------------------------------------------ END CONFIG

for k, c in CAPTIONS.items():
    assert len(c) <= 140, f"{k}: {len(c)} characters, limit is 140"
    assert "—" not in c and "–" not in c, f"{k}: no dashes"
assert [n for n, *_ in SHOTS] == list(CAPTIONS), "SHOTS and CAPTIONS must list the same names in the same order"
assert len(SHOTS) <= 8, "eight is the ceiling; a gallery is a story, not an archive"

OUT.mkdir(parents=True, exist_ok=True)

pages = [(n, sel, click) for n, kind, sel, click in SHOTS if kind == "page"]
if pages:
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True)
        for name, sel, click in pages:
            ctx = b.new_context(viewport={"width": W, "height": H}, device_scale_factor=1, color_scheme="dark")
            pg = ctx.new_page()
            pg.goto(URL, wait_until="load", timeout=60_000)
            pg.evaluate("document.fonts.ready")
            pg.wait_for_timeout(1600)  # the specimen quote lines up at 700ms
            if click is not None:
                pg.locator(".example").nth(click).click()
                pg.wait_for_selector(".verdict, .error", timeout=120_000)
                pg.wait_for_timeout(2000)  # quotes resolve
            if sel:
                pg.evaluate(f"window.scrollTo(0, document.querySelector('{sel}').getBoundingClientRect().top + window.scrollY - 40)")
                pg.wait_for_timeout(500)
            pg.screenshot(path=str(OUT / f"{name}.png"))
            ctx.close()
        b.close()

for name, kind, src, at in SHOTS:
    if kind != "frame":
        continue
    raw = OUT / f"_{name}-raw.png"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(at), "-i", str(BROLL / f"{src}.mp4"), "-frames:v", "1", str(raw)], check=True)
    im = Image.open(raw).convert("RGB")
    raw.unlink()
    bg = im.getpixel((2, 2))  # the frame's own background
    target_h = im.width * 2 // 3
    canvas = Image.new("RGB", (im.width, target_h), bg)
    canvas.paste(im, (0, (target_h - im.height) // 2))
    canvas = canvas.resize((W, H), Image.LANCZOS)
    canvas.save(OUT / f"{name}.png", optimize=True)

lines = ["# Image gallery, upload in this order", "", "One caption per image. Copy the block contents only.", ""]
for name, *_ in SHOTS:
    lines += [f"## {name}.png", "", "```", CAPTIONS[name], "```", ""]
(OUT / "captions.md").write_text("\n".join(lines), encoding="utf-8")

for name, *_ in SHOTS:
    f = OUT / f"{name}.png"
    im = Image.open(f)
    ratio = im.width / im.height
    ok = "ok " if abs(ratio - 1.5) < 0.01 and f.stat().st_size < 5_000_000 else "BAD"
    print(f"  {ok} {f.name:<22} {im.width}x{im.height}  {f.stat().st_size // 1024:>4} KB   caption {len(CAPTIONS[name]):>3}/140")
print(f"\n{len(SHOTS)} images + captions.md in {OUT.relative_to(ROOT)}")
