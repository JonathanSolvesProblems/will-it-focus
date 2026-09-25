"""Fail if the DEV post says something the committed data does not.

Checks every number in submission/devto-post.md that has a source in this repo or the
public dataset: the eval table and title against web/src/data/eval-summary.json, the
document counts against the live public dataset, the manual's page count against the PDF
text, and that the post contains no em or en dashes.

Usage: python scripts/check_claims.py
"""

import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
post = (ROOT / "submission" / "devto-post.md").read_text(encoding="utf-8")
summary = json.loads((ROOT / "web" / "src" / "data" / "eval-summary.json").read_text(encoding="utf-8"))
failures: list[str] = []


def expect(claim: str, ok: bool) -> None:
    print(("ok   " if ok else "FAIL ") + claim)
    if not ok:
        failures.append(claim)


def of(pair: list[int]) -> str:
    return f"{pair[0]} of {pair[1]}"


# The headline number and the table rows.
b, k = summary["both"], summary["kb"]
expect(f"title says {b[0]} of {b[1]}", f"{b[0]} of {b[1]} Quotes" in post.splitlines()[1])
v = summary["verdicts"]
expect("table row: Knowledge Base only", f"| Knowledge Base only | {of(v['kb'])} | {of(k)} |" in post)
expect("table row: Both", f"| Both (what the app runs) | {of(v['both'])} | {of(b)} |" in post)
expect("table row: Dataset only verdicts", f"| Dataset only | {of(v['dataset'])} |" in post)
expect(f"{summary['questions']} questions", f"{summary['questions']} questions" in post)
expect(f"model named as {summary['model']}", summary["model"] in post)

# Dataset counts, from the public API.
q = '{"total": count(*[!(_id in path("_.**"))]), "body": count(*[_type=="body"]), "lens": count(*[_type=="lens"]), "mount": count(*[_type=="mount"]), "adapter": count(*[_type=="adapter"]), "format": count(*[_type=="sensorFormat"]), "compat": count(*[_type=="compatibilityRecord"]), "caveat": count(*[_type=="focusCaveat"])}'
url = "https://qnl9jh8n.api.sanity.io/v2025-02-19/data/query/production?query=" + urllib.parse.quote(q)
c = json.load(urllib.request.urlopen(url))["result"]
counts = {
    "total": f"{c['total']} documents",
    "body": f"{c['body']} bodies",
    "lens": f"{c['lens']} lenses",
    "mount": f"{c['mount']} mounts",
    "adapter": f"{c['adapter']} adapters",
    "format": f"{c['format']} sensor formats",
    "compat": f"{c['compat']} compatibility records",
    "caveat": f"{c['caveat']} focus caveats",
}
for phrase in counts.values():
    expect(f"dataset count '{phrase}'", phrase in post)

# The manual's page count.
manual = ROOT / "data" / "kb-text" / "canon-eos-rebel-t5i-700d-instruction-manual.txt"
if manual.exists():
    pages = len(re.findall(r"=== page \d+ ===", manual.read_text(encoding="utf-8")))
    expect(f"manual is {pages} pages", f"({pages} pages)" in post and f"{pages}-page" in post)

# Writing rule: no em or en dashes.
expect("no em or en dashes", "—" not in post and "–" not in post)

print(f"\n{len(failures)} failures")
sys.exit(1 if failures else 0)
