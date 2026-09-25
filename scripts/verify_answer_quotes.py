"""Count how many quoted passages in an agent answer actually appear in a source.

A passage counts as verified only if it appears, ignoring whitespace and bullet glyphs,
in the text extracted from the manufacturer PDFs (data/kb-text) or in the collected web
page text (data/sources-raw.md). Text formatting the agent adds (bold markers) is removed
first. Nothing else is normalised: a paraphrase in quotation marks is a failure.

Usage: python scripts/verify_answer_quotes.py data/probe/kb-only-answer.txt
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IGNORED = re.compile("[\\s\u2022\u25cf\uf06c\u200b*]+")
QUOTED = re.compile("\u201c([^\u201d]{20,}?)\u201d|\"([^\"\\n]{20,}?)\"")


def squash(text: str) -> str:
    return IGNORED.sub("", text)


def corpus() -> str:
    parts = [p.read_text(encoding="utf-8") for p in sorted((ROOT / "data" / "kb-text").glob("*.txt"))]
    parts.append((ROOT / "data" / "sources-raw.md").read_text(encoding="utf-8").replace("\\n", " "))
    return squash("\n".join(parts))


def main(path: str) -> int:
    # Score the answer only: scripts/ask.mts also logs tool calls ("> ...") and the tool list.
    lines = Path(path).read_text(encoding="utf-8").splitlines()
    text = "\n".join(l for l in lines if not l.startswith(("> ", "tools:", "steps:")))
    haystack = corpus()
    quotes = [a or b for a, b in QUOTED.findall(text)]
    verified = [q for q in quotes if squash(q.rstrip(".")) in haystack]
    for q in quotes:
        mark = "ok  " if q in verified else "MISS"
        print(f"{mark} {q[:110]}")
    print(f"\n{len(verified)} of {len(quotes)} quoted passages appear in a source")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
