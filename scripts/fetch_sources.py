"""Download the manufacturer PDFs and extract their text, page by page.

The PDFs are Canon's and Sigma's documents, so they are fetched from the manufacturers
rather than committed. Output: data/kb-files/*.pdf (uploaded to the Knowledge Base) and
data/kb-text/*.txt (what scripts/check_quotes.py verifies quotes against).

Usage: python scripts/fetch_sources.py   (needs pymupdf)
"""

import urllib.request
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parent.parent
PDFS = {
    "canon-eos-rebel-t5i-700d-instruction-manual.pdf": "https://gdlp01.c-wss.com/gds/5/0300010905/07/eos-rebelt5i-700d-im7-en.pdf",
    "canon-ef-s-18-55-is-stm-instructions.pdf": "http://gdlp01.c-wss.com/gds/8/0300011908/02/efs18-55f35-56isstm-im2-eng.pdf",
    "canon-ef-s-18-55-is-ii-instructions.pdf": "https://gdlp01.c-wss.com/gds/7/0300004937/02/efs18-55f35-56-is-ii-im2-eng.pdf",
    "canon-canada-t5i-launch-2013-03-21.pdf": "https://www.canon.ca/dam/about/News/Press-Releases/2013/2013-MAR-21-EOSREBELT5I-EN.pdf",
    "sigma-mc-11-lens-compatibility.pdf": "https://www.sigma-global.com/en/support/download/SIGMA_MC_11_lens_en.pdf",
    "sigma-mc-11-camera-compatibility.pdf": "https://www.sigma-global.com/en/support/download/sigma_mc11_camera_en_ver3.pdf",
}


def main() -> None:
    files, text = ROOT / "data" / "kb-files", ROOT / "data" / "kb-text"
    files.mkdir(parents=True, exist_ok=True)
    text.mkdir(parents=True, exist_ok=True)
    for name, url in PDFS.items():
        pdf = files / name
        if not pdf.exists():
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            pdf.write_bytes(urllib.request.urlopen(req, timeout=120).read())
        doc = fitz.open(pdf)
        pages = "".join(f"\n=== page {i} ===\n" + p.get_text() for i, p in enumerate(doc, 1))
        (text / (pdf.stem + ".txt")).write_text(pages, encoding="utf-8")
        print(f"{name}: {len(doc)} pages")


if __name__ == "__main__":
    main()
