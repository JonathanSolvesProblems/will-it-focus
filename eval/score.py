"""Score eval/results against the manufacturer-transcribed answers in eval/questions.json.

Two measures per condition:
- verdicts: each field the question asks about, compared exactly with the expected value
- quotes: quoted passages in the answer that appear verbatim in a manufacturer document
  (same test as scripts/verify_answer_quotes.py)

Writes eval/results/score.json and prints a table. Usage: python eval/score.py
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from verify_answer_quotes import QUOTED, corpus, squash  # noqa: E402

VERDICT = re.compile(r"```json\s*(\{.*?\})\s*```", re.S)


def verdict_of(text: str) -> dict:
    blocks = VERDICT.findall(text)
    try:
        return json.loads(blocks[-1]) if blocks else {}
    except json.JSONDecodeError:
        return {}


def main() -> int:
    results = ROOT / (sys.argv[1] if len(sys.argv) > 1 else "eval/results")
    questions = json.loads((ROOT / "eval" / "questions.json").read_text(encoding="utf-8"))["questions"]
    haystack = corpus()
    report = {}
    for condition in ("kb", "dataset", "both"):
        folder = results / condition
        if not folder.exists():
            continue
        fields_right = fields_total = quotes_ok = quotes_total = 0
        per_question = []
        for q in questions:
            path = folder / f"{q['id']}.md"
            text = path.read_text(encoding="utf-8") if path.exists() else ""
            got = verdict_of(text)
            answer_only = VERDICT.sub("", text)
            quotes = [a or b for a, b in QUOTED.findall(answer_only)]
            ok = [x for x in quotes if squash(x.rstrip(".")) in haystack]
            right = {f: got.get(f) == v for f, v in q["expected"].items()}
            fields_right += sum(right.values())
            fields_total += len(right)
            quotes_ok += len(ok)
            quotes_total += len(quotes)
            per_question.append({"id": q["id"], "expected": q["expected"], "got": got,
                                 "quotes": len(quotes), "verbatim": len(ok)})
        report[condition] = {
            "verdictFields": [fields_right, fields_total],
            "quotes": [quotes_ok, quotes_total],
            "questions": per_question,
        }
        misses = [f"{p['id']}:{f}={p['got'].get(f)}(want {v})" for p in per_question for f, v in p["expected"].items() if p["got"].get(f) != v]
        print(f"{condition:8} verdicts {fields_right:>2}/{fields_total}   verbatim quotes {quotes_ok:>3}/{quotes_total}")
        for m in misses:
            print(f"           miss {m}")
    (results / "score.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    # The app's footer reads its numbers from here, so the page cannot drift from the measured result.
    if results == ROOT / "eval" / "results" and {"kb", "both"} <= report.keys():
        runs = json.loads((results / "runs.json").read_text(encoding="utf-8"))
        summary = {"model": runs["model"], "ranAt": runs["ranAt"], "questions": len(questions),
                   "kb": report["kb"]["quotes"], "both": report["both"]["quotes"],
                   "verdicts": {c: report[c]["verdictFields"] for c in report}}
        (ROOT / "web" / "src" / "data" / "eval-summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
