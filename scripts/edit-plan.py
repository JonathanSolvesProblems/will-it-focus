"""Build demo.edit-plan.json for vidkit from the narration transcript.

Fixes the words Whisper mangled (names and homophones, timings kept), then cuts the
timeline at spoken words so every clip lands on the sentence it illustrates. Lower thirds
come from broll/_sources.json. Render with:
  vidkit assemble broll/narration.wav --clips-dir broll --edit-plan broll/demo.edit-plan.json --out broll/demo.mp4

Usage: python scripts/edit-plan.py
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BROLL = ROOT / "broll"
transcript = json.loads((BROLL / "_transcript.json").read_text(encoding="utf-8"))

# ---------- caption corrections: (what Whisper wrote, what was said). Timings are shared out.
FIXES = [
    (["mis-focus"], ["miss", "focus"]),
    (["mis", "-focus"], ["miss", "focus"]),
    (["mis", "focus"], ["miss", "focus"]),
    (["for", "anybody.", "Lens", "and", "adapter", "it", "knows", "while", "they"],
     ["for", "any", "body,", "lens", "and", "adapter", "it", "knows.", "Will", "they"]),
    (["131", "type", "documents"], ["131", "typed", "documents"]),
    (["It", "churns"], ["It", "turned"]),
    (["canon's", "words."], ["Canon's", "words."]),
    (["Sanity", "Recorded", "sites"], ["Sanity", "record", "it", "cites."]),
    (["Each", "autofocus", "of", "verdict"], ["Each", "autofocus", "verdict"]),
    (["against", "these", "cited"], ["against", "the", "cited"]),
    (["Sigma's", "cannons", "and", "MetaBone's"], ["Sigma's,", "Canon's", "and", "Metabones'"]),
    (["words", "and", "quotation"], ["words", "in", "quotation"]),
    (["fails", "to", "build"], ["fails", "the", "build"]),
    (["drips"], ["drifts"]),
    (["well", "at", "focus."], ["Will", "It", "Focus."]),
    (["17", "seconds", "and"], ["17", "seconds.", "And"]),
    (["manual,", "that's"], ["manual.", "That's"]),
    (["tables", "with", "the", "knowledge"], ["tables.", "With", "the", "knowledge"]),
    (["words", "with", "the", "typed"], ["words.", "With", "the", "typed"]),
]

flat = [dict(w, seg=i) for i, s in enumerate(transcript["segments"]) for w in s["words"]]


def norm(w: str) -> str:
    return w.strip().lower()


applied = 0
for old, new in FIXES:
    n = len(old)
    for i in range(len(flat) - n + 1):
        if [norm(w["word"]) for w in flat[i:i + n]] == [o.lower() for o in old]:
            start, end, seg = flat[i]["start"], flat[i + n - 1]["end"], flat[i]["seg"]
            total = sum(len(x) for x in new)
            t, out = start, []
            for x in new:
                d = (end - start) * len(x) / total
                out.append({"word": " " + x, "start": round(t, 3), "end": round(t + d, 3), "seg": seg})
                t += d
            flat[i:i + n] = out
            applied += 1
            break
    else:
        print(f"fix not found: {old}")
print(f"{applied} of {len(FIXES)} caption fixes applied")

segments = []
for i, s in enumerate(transcript["segments"]):
    words = [{k: v for k, v in w.items() if k != "seg"} for w in flat if w["seg"] == i]
    segments.append({"text": "".join(w["word"] for w in words).strip(), "start": words[0]["start"], "end": words[-1]["end"], "words": words})
transcript = {"text": " ".join(s["text"] for s in segments), "duration": segments[-1]["end"], "segments": segments}
WORDS = [w for s in segments for w in s["words"]]


def at(word: str, after: float = 0.0) -> float:
    """Start of the first whole word equal to `word` (case-insensitive, punctuation ignored) after `after`."""
    for w in WORDS:
        if w["start"] >= after and re.sub(r"[^\w']", "", w["word"]).lower() == word.lower():
            return round(w["start"], 2)
    raise KeyError(f"{word!r} not found after {after}s")


# ---------- cut points, each on the first word of the sentence the next clip illustrates
b = {
    "manual": at("Canon's", 4),
    "will": at("Will", 20),
    "they": at("Will", 25),
    "runs": at("runs", 30),
    "heres": at("Here's", 55),
    "second": at("second", 76),
    "thats": at("That's", 94),
    "good": at("good", 100),
    "line": at("line", 115),
    "if": at("if", 124),
    "each": at("Each", 138),
    "live": at("live", 144),
    "and": at("And", 147),  # "17 seconds. And when nobody has published an answer"
    "measured": at("measured", 160),
    "every": at("Every", 188),
    "its": at("It's", 200),
}
speech_end = round(WORDS[-1]["end"] + 0.3, 2)
END = 215.0  # the padded narration runs 215.2 s; the end card sits on the silence

sources = {e["beat"]: e["lower_third"] for e in json.loads((BROLL / "_sources.json").read_text(encoding="utf-8"))}
LT = {
    "manual": "Source: Canon T5i manual, p.100",
    "dataset": "Source: Sanity dataset qnl9jh8n",
    "pages": "Source: Canon T5i manual, 388 pages",
    "entries": "Source: Sanity Context outline, 10 entries",
    "timed": "Source: timed live run, 17 s",
    "eval": "Source: eval/results, gpt-5.4-mini",
    "scripts": "Source: check_quotes.py, 137 quotes",
}
assert set(LT.values()) <= set(sources.values()), "every lower third must be a verified source"

# clip, in_point, effect, lower third
cuts = [
    (0.0, b["manual"], "oldFilmIDid", 13.2, "none", ""),
    (b["manual"], b["will"], "08-manual", 0.5, "none", LT["manual"]),
    (b["will"], b["they"], "01-home", 0.3, "none", ""),
    (b["they"], b["runs"], "02-saved-t5i", 0.5, "none", ""),
    (b["runs"], b["heres"], "09-context", 0.5, "none", LT["dataset"]),
    (b["heres"], b["second"], "03-saved-sigma", 0.5, "none", ""),
    (b["second"], b["thats"], "10-kb-sources", 0.5, "none", LT["pages"]),
    (b["thats"], b["good"], "11-kb-entries", 0.5, "none", LT["entries"]),
    (b["good"], b["line"], "02b-t5i-summaries", 4.0, "none", ""),
    (b["line"], b["if"], "12-gate-code", 0.5, "none", ""),
    (b["if"], b["each"], "02-saved-t5i", 0.55, "none", ""),
    (b["each"], b["live"], "03-saved-sigma", 3.0, "none", ""),
    (b["live"], b["and"], "05-live-question", round(17.0 - (b["and"] - 0.8 - b["live"]), 2), "none", LT["timed"]),
    (b["and"], b["measured"], "04-refusal", 0.5, "none", ""),
    (b["measured"], b["every"], "13-eval", 0.5, "none", LT["eval"]),
    (b["every"], b["its"], "14-scripts", 0.5, "none", LT["scripts"]),
    (b["its"], speech_end, "06-light-theme", 4.0, "none", ""),
    (speech_end, END, "s99-end", 0.0, "none", ""),
]
import subprocess


def paint_time(clip_id: str) -> float:
    """Seconds until a recorded app clip first shows the page (mean luma above 60).

    A deployed page can take a few seconds to answer, and Playwright records from the
    moment the context opens, so a clip can start with a dark, unpainted frame. Seeking
    in before that point puts black in the cut.
    """
    path = next((BROLL / f"{clip_id}{ext}" for ext in (".mp4", ".webm") if (BROLL / f"{clip_id}{ext}").exists()), None)
    if path is None:
        return 0.0
    out = subprocess.run(
        ["ffmpeg", "-hide_banner", "-t", "8", "-i", str(path), "-vf", "fps=20,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-", "-an", "-f", "null", "-"],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    ).stdout
    t = 0.0
    for line in out.splitlines():
        m = re.search(r"pts_time:([\d.]+)", line)
        if m:
            t = float(m.group(1))
        m = re.search(r"YAVG=([\d.]+)", line)
        if m and float(m.group(1)) > 60:
            return t
    return 0.0


segs = []
for s, e, c, ip, fx, lt in cuts:
    if c[0] == "0" and c[:2] != "08" and c[:2] != "09":  # recorded app clips, not cards
        painted = paint_time(c) + 0.25
        if painted > ip:
            print(f"  {c}: page paints at {painted - 0.25:.2f}s, in_point {ip} -> {painted:.2f}")
            ip = round(painted, 2)
    segs.append({"clip_id": c, "start_time": s, "end_time": e, "lower_third": lt, "effect": fx, "in_point": ip})
for a, z in zip(segs, segs[1:]):
    assert a["end_time"] == z["start_time"], (a, z)
for s in segs:
    assert s["end_time"] > s["start_time"] and s["in_point"] >= 0, s

plan = {
    "project_name": "Will It Focus",
    "add_intro_card": True,
    "intro_clip": "s00-title",
    "intro_duration": 3.5,
    "intro_effect": "none",
    "add_outro_card": False,
    "theme": {"palette": {"bg": "#0A0A0A", "accent": "#3FB8DA", "text": "#E6E6E0", "text2": "#8C8C86"}},
    "segments": segs,
    "_transcript": transcript,
}
(BROLL / "demo.edit-plan.json").write_text(json.dumps(plan, indent=2, ensure_ascii=False), encoding="utf-8")
for s in segs:
    print(f"{s['start_time']:7.2f} -> {s['end_time']:7.2f}  {s['clip_id']:22} in {s['in_point']:5.2f}  {s['lower_third']}")
print("cut points:", b)
