"""Fail if any quote in data/records.ndjson is not in the source it cites.

PDF sources are checked against the text extracted from the PDF itself (data/kb-text),
on the page the record names (PDF page index, not the printed page number). Web sources
are checked against data/sources-raw.md, which holds the page text as collected.
Whitespace and bullet glyphs are ignored, nothing else.

Usage: python scripts/check_quotes.py
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PDF_TEXT = {
    "https://gdlp01.c-wss.com/gds/5/0300010905/07/eos-rebelt5i-700d-im7-en.pdf": "canon-eos-rebel-t5i-700d-instruction-manual.txt",
    "http://gdlp01.c-wss.com/gds/8/0300011908/02/efs18-55f35-56isstm-im2-eng.pdf": "canon-ef-s-18-55-is-stm-instructions.txt",
    "https://gdlp01.c-wss.com/gds/7/0300004937/02/efs18-55f35-56-is-ii-im2-eng.pdf": "canon-ef-s-18-55-is-ii-instructions.txt",
    "https://www.sigma-global.com/en/support/download/SIGMA_MC_11_lens_en.pdf": "sigma-mc-11-lens-compatibility.txt",
    "https://www.sigma-global.com/en/support/download/sigma_mc11_camera_en_ver3.pdf": "sigma-mc-11-camera-compatibility.txt",
}

# whitespace, the bullet glyphs the PDFs use, and zero-width spaces
IGNORED = re.compile("[\\s•●​]+")


def squash(text: str) -> str:
    return IGNORED.sub("", text)


def pages(path: Path) -> dict[int, str]:
    parts = re.split(r"=== page (\d+) ===", path.read_text(encoding="utf-8"))
    return {int(parts[i]): squash(parts[i + 1]) for i in range(1, len(parts), 2)}


def sources_of(doc: dict):
    if isinstance(doc.get("source"), dict):
        yield doc["source"]
    yield from doc.get("sources") or []


def main() -> int:
    pdf_pages = {url: pages(ROOT / "data" / "kb-text" / name) for url, name in PDF_TEXT.items()}
    # sources-raw.md stores table cells as JSON strings, so a line break there is a literal \n.
    raw = squash((ROOT / "data" / "sources-raw.md").read_text(encoding="utf-8").replace("\\n", " "))
    checked, failures = 0, []

    for line in (ROOT / "data" / "records.ndjson").read_text(encoding="utf-8").splitlines():
        doc = json.loads(line)
        for s in sources_of(doc):
            quote = s.get("quote")
            if not quote:
                failures.append(f"{doc['_id']}: source {s.get('url')} has no quote")
                continue
            checked += 1
            q = squash(quote)
            if s["url"] in pdf_pages:
                text = pdf_pages[s["url"]]
                page = s.get("page")
                if page is None:
                    failures.append(f"{doc['_id']}: PDF source without a page number")
                elif q not in text.get(page, ""):
                    found = [p for p, t in text.items() if q in t]
                    hint = f" (found on page {found})" if found else " (not in the PDF at all)"
                    failures.append(f"{doc['_id']}: quote not on page {page}{hint}: {quote[:70]}")
            elif q not in raw:
                failures.append(f"{doc['_id']}: quote not in sources-raw.md: {quote[:70]}")

    for f in failures:
        print("FAIL", f)
    print(f"{checked} quotes checked, {len(failures)} failures")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
