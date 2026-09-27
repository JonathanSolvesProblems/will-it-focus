"""Generate the demo's card clips and title cards.

Each card is an HTML page in the app's own palette and fonts, recorded by Playwright at
1920x1080, with its animations timed to the words in broll/_transcript.json. Nothing on a
card is typed by hand: the record comes from the public dataset, the eval numbers from
eval/results/score.json, the gate code from verdict.ts, the script outputs from running the
scripts, and the manual page from the Canon PDF.

Writes broll/08-*.webm ... 14-*.webm, broll/s00-title.png, broll/s99-end.png, and
broll/_card-times.json (the narration second each card starts at, for the edit plan).

Usage: python scripts/broll-cards.py [--only 08,13]
"""

import json
import shutil
import subprocess
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
BROLL = ROOT / "broll"
ONLY = sys.argv[sys.argv.index("--only") + 1].split(",") if "--only" in sys.argv else None

# ---------- narration timing

TRANSCRIPT = json.loads((BROLL / "_transcript.json").read_text(encoding="utf-8"))
WORDS = [w for s in TRANSCRIPT["segments"] for w in s["words"]]


def at(word: str, after: float = 0.0) -> float:
    """Start time of the first spoken word containing `word` (case-insensitive) after `after`."""
    needle = word.lower()
    for w in WORDS:
        if w["start"] >= after and needle in w["word"].lower():
            return w["start"]
    raise KeyError(f"word {word!r} not found after {after}s")


CARD_START = {
    "08-manual": at("Canon's", 4),
    "09-context": at("runs", 30),
    "10-kb-sources": at("second", 76),
    "11-kb-entries": at("That's", 94),
    "12-gate-code": at("line", 115),
    "13-eval": at("measured", 160),
    "14-scripts": at("Every", 188),
}

# ---------- shared style

FONTS = "https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600&family=Hanken+Grotesk:wght@400;500;600&family=Newsreader:ital@0;1&display=swap"
CSS = """
:root{--surround:#0a0a0a;--ink:#e6e6e0;--muted:#8c8c86;--glass:#cfcfc8;--glass-ink:#161715;--glass-muted:#555651;--rule:#9e9f98;--accent:#3fb8da;--accent-glass:#0b5e78;--fringe-a:#00b4e6;--fringe-b:#e6284b}
*{box-sizing:border-box}
html,body{margin:0;width:1920px;height:1080px;background:var(--surround);color:var(--ink);font-family:'Hanken Grotesk',system-ui,sans-serif;overflow:hidden;font-size:30px;line-height:1.4}
.marking{font-family:Jost,sans-serif;text-transform:uppercase;letter-spacing:.14em;font-size:22px;color:var(--muted)}
.screen{position:absolute;left:120px;right:120px;top:64px;bottom:170px;background:var(--glass);color:var(--glass-ink);border-radius:26px;padding:56px 72px;box-shadow:inset 0 0 140px rgba(0,0,0,.28),inset 0 0 24px rgba(0,0,0,.18);overflow:hidden}
.screen .marking{color:var(--glass-muted)}
h1{font-family:Jost,sans-serif;font-weight:500;font-size:54px;line-height:1.15;margin:0 0 28px;letter-spacing:.01em}
.a{opacity:0;transform:translateY(14px)}
body.play .a{animation:appear .55s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes appear{to{opacity:1;transform:none}}
.quote{font-family:Newsreader,Georgia,serif;font-size:38px;line-height:1.35}
.mono{font-family:Consolas,'Cascadia Mono',monospace}
.ring{outline:4px solid var(--accent-glass);outline-offset:6px;border-radius:12px}
"""


def page(body: str, extra_css: str = "") -> str:
    return f"""<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="{FONTS}">
<style>{CSS}{extra_css}</style></head><body>{body}</body></html>"""


def delay(t: float) -> str:
    return f'style="animation-delay:{max(0.0, t):.2f}s"'


# ---------- data

def groq(query: str):
    url = "https://qnl9jh8n.api.sanity.io/v2025-02-19/data/query/production?query=" + urllib.parse.quote(query)
    return json.load(urllib.request.urlopen(url))["result"]


def run_output(cmd: list[str]) -> str:
    return subprocess.run(cmd, capture_output=True, text=True, cwd=ROOT, encoding="utf-8").stdout.strip().splitlines()[-1]


# ---------- cards

def card_manual() -> tuple[str, float]:
    start = CARD_START["08-manual"]
    zoom_at = at("page", start) - start
    line1 = at("closest", start) - start
    line2 = at("not", line1 + start) - start
    hold = at("read", start) - start + 2.5
    # Page image is 894x1260 (3x). The two sentences sit at y 117..173, x 51..802.
    s0, s1 = 1080 / 1260, 2.0
    x0, y0 = (1920 - 894 * s0) / 2, 0
    x1, y1 = 960 - 426 * s1, 540 - 145 * s1
    css = f"""
    #pg{{position:absolute;left:0;top:0;width:894px;transform-origin:0 0;transform:translate({x0:.0f}px,{y0:.0f}px) scale({s0:.4f});box-shadow:0 0 80px rgba(0,0,0,.6)}}
    body.play #pg{{animation:zoom 2.4s cubic-bezier(.2,.8,.2,1) {zoom_at:.2f}s forwards}}
    @keyframes zoom{{to{{transform:translate({x1:.0f}px,{y1:.0f}px) scale({s1})}}}}
    .hl{{position:absolute;left:51px;height:29px;width:0;background:rgba(255,229,0,.55);mix-blend-mode:multiply}}
    body.play .hl{{animation:sweep 1.1s ease-out forwards}}
    @keyframes sweep{{to{{width:752px}}}}
    """
    body = f"""<div id="pg"><img src="_manual-p100.png" width="894" height="1260">
      <div class="hl" style="top:116px;animation-delay:{line1:.2f}s"></div>
      <div class="hl" style="top:145px;animation-delay:{line2:.2f}s"></div></div>"""
    return page(body, css), hold


def card_context() -> tuple[str, float]:
    start = CARD_START["09-context"]
    rec = groq('*[_id=="compat-mc11-sigma-art-35mm-f1-4-dg-hsm"][0]{_id,_type,scope,shootingMode,singleAf,continuousAf,dmf,"lens":lenses[0]->name,"adapters":adapters[]->name,"bodies":count(bodies),source}')
    counts = groq('{"body":count(*[_type=="body"]),"lens":count(*[_type=="lens"]),"mount":count(*[_type=="mount"]),"adapter":count(*[_type=="adapter"]),"compat":count(*[_type=="compatibilityRecord"]),"caveat":count(*[_type=="focusCaveat"]),"format":count(*[_type=="sensorFormat"]),"total":count(*[!(_id in path("_.**"))])}')
    t_one = at("One", start) - start
    t_131 = at("131", start) - start
    t_types = {k: at(k, start) - start for k in ("bodies", "lenses", "mounts", "adapters", "compatibility")}
    t_rec = at("sentence", start) - start - 1.6
    t_quote = at("sentence", start) - start
    t_page = at("page", at("sentence", start)) - start
    end = at("Here's", start) - start + 0.6

    def row(label, n, t):
        return f'<div class="row a" {delay(t)}><b>{n}</b><span>{label}</span></div>'

    rows = "".join([
        row("bodies", counts["body"], t_types["bodies"]),
        row("lenses", counts["lens"], t_types["lenses"]),
        row("mounts", counts["mount"], t_types["mounts"]),
        row("adapters", counts["adapter"], t_types["adapters"]),
        row("compatibility records", counts["compat"], t_types["compatibility"]),
        row("focus caveats", counts["caveat"], t_types["compatibility"] + 0.5),
        row("sensor formats", counts["format"], t_types["compatibility"] + 0.8),
    ])
    src = rec["source"]
    fields = [
        ("_type", rec["_type"]), ("lenses[0]", rec["lens"]), ("adapters", " · ".join(rec["adapters"])),
        ("bodies", "none listed: the source did not limit it"), ("shootingMode", rec["shootingMode"]),
        ("singleAf", rec["singleAf"]), ("continuousAf", rec["continuousAf"]), ("dmf", rec["dmf"]),
    ]
    field_html = "".join(f'<div class="f a" {delay(t_rec + 0.25 + i * 0.12)}><i>{k}</i><span>{v}</span></div>' for i, (k, v) in enumerate(fields))
    css = """
    .cols{display:grid;grid-template-columns:1fr 1fr;gap:56px;height:100%}
    .box{border:2px solid var(--rule);border-radius:14px;padding:22px 26px;margin-top:18px}
    .box.lit{outline:4px solid var(--accent-glass);outline-offset:5px}
    .box .name{font-family:Jost,sans-serif;font-weight:600;font-size:30px}
    .box .sub{color:var(--glass-muted);font-size:26px}
    .big{font-family:Jost,sans-serif;font-size:72px;font-weight:500;line-height:1;margin:18px 0 4px}
    .row{display:flex;gap:18px;align-items:baseline;font-size:29px;padding:1px 0}
    .row b{font-family:Jost,sans-serif;font-weight:600;min-width:74px;text-align:right}
    .rec{border:2px solid var(--rule);border-radius:14px;padding:22px 26px;font-size:24px}
    .rec .id{font-family:Consolas,monospace;color:var(--glass-muted);font-size:21px;margin-bottom:10px}
    .f{display:grid;grid-template-columns:190px 1fr;gap:12px;padding:3px 0}
    .f i{font-style:normal;color:var(--glass-muted);font-family:Consolas,monospace;font-size:21px}
    .srcq{margin-top:14px;padding:14px 18px;border-radius:10px;background:rgba(255,255,255,.35)}
    .srcq .quote{font-size:34px}
    /* an element that both appears and later lights up carries two animations and two delays */
    body.play .a.lit-later{animation:appear .55s cubic-bezier(.2,.8,.2,1) forwards, lit .01s linear forwards}
    body.play .lit-later:not(.a){animation:lit .01s linear forwards}
    @keyframes lit{to{outline:4px solid var(--accent-glass);outline-offset:5px;border-radius:10px}}
    """
    body = f"""<div class="screen"><div class="cols">
    <div>
      <div class="marking a" {delay(0)}>Sanity Context</div>
      <h1 class="a" {delay(0.1)}>Two endpoints, one agent</h1>
      <div class="box a lit-later" style="animation-delay:.5s,{t_one:.2f}s"><div class="name">will-it-focus</div><div class="sub">dataset · GROQ mode · verdicts</div></div>
      <div class="box a" {delay(1.3)}><div class="name">will-it-focus-kb</div><div class="sub">Knowledge Base · explanations</div></div>
      <div class="big a" {delay(t_131)}>{counts['total']}<span style="font-size:30px;font-weight:400;margin-left:14px">documents</span></div>
      {rows}
    </div>
    <div>
      <div class="rec a" {delay(t_rec)}>
        <div class="id">{rec['_id']}</div>
        {field_html}
        <div class="srcq a" {delay(t_rec + 1.3)}>
          <div class="marking">source</div>
          <div class="quote lit-later" style="animation-delay:{t_quote:.2f}s">“{src['quote']}”</div>
          <div class="f" style="margin-top:10px"><i>page</i><span class="lit-later" style="animation-delay:{t_page:.2f}s;display:inline-block;padding:0 8px">{src['page']}</span></div>
          <div class="f"><i>publisher</i><span>{src['publisher']}</span></div>
          <div class="f"><i>url</i><span style="font-size:20px;word-break:break-all">{src['url']}</span></div>
        </div>
      </div>
    </div></div></div>"""
    return page(body, css), end


def card_kb_sources() -> tuple[str, float]:
    start = CARD_START["10-kb-sources"]
    t_ring = at("388", start) - start
    end = at("That's", start) - start
    css = """
    /* the caption sits above the screenshot: the bottom of the frame belongs to the burned-in subtitles */
    .shot{position:absolute;left:135px;top:84px;width:1651px;height:831px;border-radius:16px;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,.6)}
    .shot img{display:block;width:1651px}
    /* the third row of the screenshot is canon-eos-rebel-t5i-700d-instruction-manual.pdf */
    .r{position:absolute;left:33px;top:474px;width:1585px;height:58px;border:4px solid var(--accent);border-radius:10px;opacity:0}
    body.play .r{animation:appear .4s forwards}
    .cap{position:absolute;left:135px;top:24px;font-size:26px;color:var(--muted)}
    """
    body = f"""<div class="cap a" {delay(0.6)}>Sanity Context · Knowledge Base <b>Camera autofocus sources</b> · six files, one document each · 10 entries</div>
    <div class="shot a" {delay(0.1)}><img src="_kb-sources-raw.png"><div class="r" {delay(t_ring)}></div></div>"""
    return page(body, css), end


def card_kb_entries() -> tuple[str, float]:
    start = CARD_START["11-kb-entries"]
    text = json.loads((ROOT / "data" / "probe" / "initial_context.json").read_text(encoding="utf-8"))["result"]["content"][0]["text"]
    # The outline lists each entry path at the start of its own line.
    entries = [l.strip().split(" ")[0] for l in text.splitlines() if l.strip() and l.split(" ")[0] in (
        "adapter_compatibility/sigma_mc11", "camera_body/exposure_and_metering", "camera_body/maintenance_and_troubleshooting",
        "camera_body/playback_and_output", "camera_body/setup_and_operation", "camera_body/specifications", "lens_autofocus",
        "lens_stabilization", "live_view_autofocus", "viewfinder_autofocus/af_operation_and_point_selection")]
    # Rows start as "turned the manuals into 10 entries" is said, so all ten are up before the cut.
    # Whisper heard "churns" for "turned"; the caption fix lives in edit-plan.py, so accept either here.
    try:
        t0 = at("turned", start) - start
    except KeyError:
        t0 = at("churns", start) - start
    end = at("rewrites", start) - start + 0.5
    rows = "".join(f'<div class="e a" {delay(t0 + i * 0.3)}><span class="n">{i + 1:02d}</span>{e}</div>' for i, e in enumerate(entries))
    css = ".e{font-family:Consolas,monospace;font-size:31px;padding:6px 0;display:flex;gap:22px}.e .n{color:var(--glass-muted)}.core{color:var(--accent-glass)}"
    body = f"""<div class="screen"><div class="marking a" {delay(0)}>Knowledge Base outline · what the agent walks</div>
    <h1 class="a" {delay(0.1)}>Six PDFs became {len(entries)} entries</h1>{rows}</div>"""
    return page(body, css), max(end, 7.5)


def card_gate_code() -> tuple[str, float]:
    start = CARD_START["12-gate-code"]
    src = (ROOT / "web" / "src" / "agent" / "verdict.ts").read_text(encoding="utf-8").splitlines()
    i0 = next(i for i, l in enumerate(src) if "The spans a quote may legitimately be" in l)
    i1 = next(i for i, l in enumerate(src) if l.startswith("function matches")) + 4
    lines = src[i0:i1]
    t_hl = at("looked", start) - start
    end = at("record", start + 4) - start + 1.5

    def esc(s):
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    html_lines = []
    for i, l in enumerate(lines):
        cls = " c" if l.strip().startswith("//") else ""
        t = 0.3 + i * 0.1
        if l.startswith("function matches") or "spans(sourceQuote).includes" in l:
            html_lines.append(f'<div class="ln a hl{cls}" style="animation-delay:{t:.2f}s,{t_hl:.2f}s">{esc(l) or "&nbsp;"}</div>')
        else:
            html_lines.append(f'<div class="ln a{cls}" {delay(t)}>{esc(l) or "&nbsp;"}</div>')
    css = """
    .code{font-family:Consolas,'Cascadia Mono',monospace;font-size:26px;line-height:1.45;white-space:pre;margin-top:10px}
    .ln.c{color:var(--glass-muted)}
    body.play .ln.hl{animation:appear .55s cubic-bezier(.2,.8,.2,1) forwards, mark .3s linear forwards}
    @keyframes mark{to{background:rgba(63,184,218,.28)}}
    """
    body = f"""<div class="screen"><div class="marking a" {delay(0)}>web/src/agent/verdict.ts</div>
    <h1 class="a" {delay(0.1)}>A quote counts only as a whole sentence of its record</h1><div class="code">{''.join(html_lines)}</div></div>"""
    return page(body, css), end


def card_eval() -> tuple[str, float]:
    start = CARD_START["13-eval"]
    s = json.loads((ROOT / "eval" / "results" / "score.json").read_text(encoding="utf-8"))
    summary = json.loads((ROOT / "web" / "src" / "data" / "eval-summary.json").read_text(encoding="utf-8"))
    t_head = at("With", start) - start
    t_kb = t_head + 0.3
    t_one = at("one", t_head + start) - start
    t_both = at("21", start) - start
    t_ds = at("verdicts", start) - start
    t_col = at("difference", start) - start
    end = at("manufacturer.", t_col + start) - start + 1.2 if any("manufacturer." in w["word"] for w in WORDS if w["start"] > t_col + start) else t_col + 6

    def of(p):
        return f"{p[0]} of {p[1]}"

    rows = [
        ("Knowledge Base only", s["kb"], t_kb),
        ("Dataset only", s["dataset"], t_ds),
        ("Both, what the app runs", s["both"], t_both),
    ]
    def cell(name, r):
        # The value sits in its own span, so lighting the column up later never fights the row's appear animation.
        extra = " one" if name.startswith("Knowledge") else (" big" if name.startswith("Both") else "")
        return f'<td class="q"><span class="qv{extra}">{of(r["quotes"])}</span></td>'

    tr = "".join(
        f'<tr class="a" {delay(t)}><td>{name}</td><td>{of(r["verdictFields"])}</td>{cell(name, r)}</tr>'
        for name, r, t in rows)
    css = f"""
    table{{border-collapse:collapse;width:100%;margin-top:18px;font-size:34px;table-layout:fixed}}
    th{{text-align:left;font-family:Jost,sans-serif;text-transform:uppercase;letter-spacing:.1em;font-size:20px;color:var(--glass-muted);padding:0 18px 14px;border-bottom:2px solid var(--rule)}}
    td{{padding:22px 18px;border-bottom:1px solid var(--rule)}}
    td.q{{font-family:Jost,sans-serif;font-weight:600;font-size:44px}}
    .qv{{display:inline-block;padding:2px 16px;border-radius:10px}}
    .qv.big{{font-size:64px}}
    body.play .qv{{animation:col .45s ease-out {t_col:.2f}s forwards}}
    body.play .qv.one{{animation:fringe .01s linear {t_one:.2f}s forwards, col .45s ease-out {t_col:.2f}s forwards}}
    @keyframes fringe{{to{{color:var(--fringe-b)}}}}
    @keyframes col{{to{{background:rgba(63,184,218,.22)}}}}
    .foot{{margin-top:26px;color:var(--glass-muted);font-size:26px}}
    """
    body = f"""<div class="screen">
    <div class="marking a" {delay(0)}>Measured · {summary['questions']} questions · {summary['model']}</div>
    <h1 class="a" {delay(0.1)}>Answers graded by Sigma's, Canon's and Metabones' own tables</h1>
    <table><thead><tr class="a" {delay(t_head)}><th>Sanity Context sources</th><th>Verdicts matching the manufacturer</th><th class="qh">Quoted passages found word for word</th></tr></thead>
    <tbody>{tr}</tbody></table>
    <div class="foot a" {delay(t_col + 0.6)}>The verdicts are close either way. The difference is whose words are in the quotation marks.</div></div>"""
    return page(body, css), end


def card_scripts() -> tuple[str, float]:
    start = CARD_START["14-scripts"]
    out1 = run_output([sys.executable, "scripts/check_quotes.py"])
    out2 = run_output([sys.executable, "-X", "utf8", "scripts/check_claims.py"])
    t_o1 = at("script", start) - start
    t_l2 = at("second", start) - start
    t_o2 = at("fails", start) - start + 0.4
    end = at("live", start) - start + 0.4
    css = """
    .term{font-family:Consolas,'Cascadia Mono',monospace;font-size:34px;line-height:1.6;margin-top:24px}
    .p{color:var(--glass-muted)}
    .ok{color:var(--accent-glass);font-weight:600}
    """
    body = f"""<div class="screen"><div class="marking a" {delay(0)}>Honesty, enforced by two scripts</div>
    <h1 class="a" {delay(0.1)}>The build fails if the words and the data disagree</h1>
    <div class="term">
      <div class="a" {delay(0.5)}><span class="p">$</span> python scripts/check_quotes.py</div>
      <div class="a ok" {delay(t_o1)}>{out1}</div>
      <div class="a" {delay(t_l2)}><span class="p">$</span> python scripts/check_claims.py</div>
      <div class="a ok" {delay(t_o2)}>{out2}</div>
    </div></div>"""
    return page(body, css), max(end, 7)


def card_title(end: bool) -> str:
    css = """
    .card{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0}
    .face{width:300px;height:300px;border-radius:50%;object-fit:cover;object-position:center top;box-shadow:0 0 0 5px var(--accent),0 30px 80px rgba(0,0,0,.6)}
    h1{font-size:92px;margin:44px 0 0;text-transform:uppercase;letter-spacing:.08em}
    .rule{width:180px;height:5px;background:var(--accent);margin:26px 0 22px;border-radius:3px}
    .site{font-family:Jost,sans-serif;letter-spacing:.06em;color:var(--muted);font-size:34px}
    .ask{margin-top:44px;text-align:center;color:var(--ink);font-size:32px;line-height:1.5}
    .ask b{color:var(--accent);font-weight:500}
    """
    ask = ('<div class="ask">Live, no login: <b>will-it-focus.vercel.app</b><br>Built for the DEV Sanity Challenge. Questions and comments welcome on the post.</div>' if end else "")
    body = f'<div class="card"><img class="face" src="_headshot.jpg"><h1>Will It Focus</h1><div class="rule"></div><div class="site">jonathansolvesproblems.com</div>{ask}</div>'
    return page(body, css)


# ---------- recording

def record(browser, name: str, html: str, seconds: float) -> None:
    (BROLL / f"_{name}.html").write_text(html, encoding="utf-8")
    tmp = BROLL / ".tmp"
    tmp.mkdir(exist_ok=True)
    ctx = browser.new_context(viewport={"width": 1920, "height": 1080}, record_video_dir=str(tmp), record_video_size={"width": 1920, "height": 1080})
    pg = ctx.new_page()
    pg.goto((BROLL / f"_{name}.html").as_uri())
    pg.evaluate("document.fonts.ready")
    pg.wait_for_timeout(500)
    pg.evaluate("document.body.classList.add('play')")
    pg.wait_for_timeout(int(seconds * 1000))
    video = pg.video
    ctx.close()
    dest = BROLL / f"{name}.webm"
    shutil.move(video.path(), dest)
    if shutil.which("ffmpeg"):
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(dest), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30", "-crf", "18", str(dest.with_suffix(".mp4"))], check=True)
    print(f"{name}: {seconds:.1f}s recorded")


def snapshot(browser, name: str, html: str) -> None:
    (BROLL / f"_{name}.html").write_text(html, encoding="utf-8")
    pg = browser.new_page(viewport={"width": 1920, "height": 1080})
    pg.goto((BROLL / f"_{name}.html").as_uri())
    pg.evaluate("document.fonts.ready")
    pg.wait_for_timeout(700)
    pg.screenshot(path=str(BROLL / f"{name}.png"))
    pg.close()
    print(f"{name}: still")


CARDS = {
    "08-manual": card_manual,
    "09-context": card_context,
    "10-kb-sources": card_kb_sources,
    "11-kb-entries": card_kb_entries,
    "12-gate-code": card_gate_code,
    "13-eval": card_eval,
    "14-scripts": card_scripts,
}


def main() -> None:
    (BROLL / "_card-times.json").write_text(json.dumps(CARD_START, indent=2), encoding="utf-8")
    print("card starts:", {k: round(v, 2) for k, v in CARD_START.items()})
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name, build in CARDS.items():
            if ONLY and not any(name.startswith(o) for o in ONLY):
                continue
            html, seconds = build()
            record(browser, name, html, seconds + 1.5)
        if not ONLY or any(o.startswith("s") for o in ONLY):
            snapshot(browser, "s00-title", card_title(end=False))
            snapshot(browser, "s99-end", card_title(end=True))
        browser.close()
    shutil.rmtree(BROLL / ".tmp", ignore_errors=True)


if __name__ == "__main__":
    main()
