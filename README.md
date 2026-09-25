# Will It Focus

Ask whether a camera body, lens and adapter will autofocus together, and why focus still misses. Every quote in the answer is checked, by code, against the manufacturer's own document.

Live: **https://will-it-focus.vercel.app** (no login)

Built for the [DEV Sanity Challenge](https://dev.to/challenges/sanity-2026-09-16), Path One: an agent that queries real content through Sanity Context.

## Why

When I was working in film, my Canon T5i would sometimes have trouble focusing in auto mode, and I often just switched to manual and did it myself. Canon's manual explains it on page 100: "In Basic Zone modes, the camera will normally focus the closest subject automatically. Therefore, it may not always focus your target subject."

Compatibility questions have published answers that are hard to find and easy to misquote. Sigma's MC-11 table says which of its lenses keep AF-C on a Sony body (none of them). Canon's lens sheet names the four bodies its 18-55 STM does quiet Movie Servo AF on. This agent reads those documents and refuses to put words in the manufacturer's mouth.

## How it works

Two Sanity Context MCP endpoints, one agent (OpenAI gpt-5.4-mini through the Vercel AI SDK):

- `will-it-focus` serves the dataset in GROQ mode. Verdicts come from here: 131 documents across seven types (35 bodies, 34 lenses, 10 mounts, 5 adapters, 3 sensor formats, 36 compatibility records, 8 focus caveats), each fact carrying its source URL, page and the verbatim sentence it rests on.
- `will-it-focus-kb` serves a Knowledge Base built from six manufacturer PDFs. Explanations come from here, and the page labels them as summaries rather than the manufacturer's words.

After the model answers, `web/src/agent/verdict.ts` looks up every quote in the Sanity record it cites. A quote counts only if it is a whole sentence, or run of sentences, of that record's `source.quote`. Anything else is shown as unverified with the record's real sentence underneath. Each AF state is compared with the cited records' fields and labelled when none supports it. If no record covers the combination, the page says so instead of guessing that an adapter that fits will also focus.

## Measured

20 questions whose answers are in Sigma's, Canon's and Metabones' own tables and manuals ([eval/questions.json](eval/questions.json)), run three ways on gpt-5.4-mini:

| Sanity Context sources | Verdicts matching the manufacturer | Quoted passages found word for word in a manufacturer document |
|---|---|---|
| Knowledge Base only | 37 of 43 | 1 of 10 |
| Dataset only | 39 of 43 | 28 of 31 |
| Both (what the app runs) | 38 of 43 | 21 of 22 |

Every answer is in [eval/results/](eval/results/). `python eval/score.py` regenerates the table and writes the numbers the app's footer reads.

## What it does not do

- The gate proves a quote is in the record it cites. It does not prove the agent cited the right record for your exact combination.
- The dataset is small: the T5i era of Canon, Sigma's MC-11, Metabones' EF-E Mark V and Canon's EF-EOS R and EF-EOS M adapters.
- Five flange distances come from Wikipedia because no manufacturer page states them. Those records say so.
- The four example questions on the page are saved answers, generated once with gpt-5.5 and re-checked against the current records every time they are served. Typed questions run live.

## Layout

| Path | What |
|---|---|
| `studio/schemaTypes/` | The Sanity schema |
| `data/build-records.mjs` | Builds every record from its source into `data/records.ndjson` |
| `data/sources-raw.md` | The collected page text every web quote is checked against |
| `scripts/fetch_sources.py` | Downloads the manufacturer PDFs and extracts their text (not committed, they are Canon's and Sigma's) |
| `scripts/check_quotes.py` | Fails if any record quote is not on the stated page of its PDF, or not in the collected page text |
| `scripts/check_claims.py` | Fails if a number in the README or the DEV post disagrees with the data |
| `web/src/agent/` | The agent, the quote gate and the cost guards |
| `web/scripts/test-gate.mts` | The gate against the cases a code review found |
| `web/eval/run.mts`, `eval/score.py` | The eval |
| `scripts/shoot.py`, `scripts/broll.py` | Screenshots and demo footage from the deployed site |

## Running it

```
cd web && npm install
cp ../.env.example .env.local   # fill in the values
npm run dev
```

Environment variables:

| Name | What |
|---|---|
| `SANITY_ORGANIZATION_TOKEN` | Organization token with Context permission |
| `OPENAI_API_KEY` | For the agent model |
| `SANITY_WRITE_TOKEN` | Editor token, only for the daily usage counter (private document) |
| `DAILY_LIVE_LIMIT` | Live answers per day across all visitors, default 60 |
| `AGENT_MODEL` | Default `gpt-5.4-mini` |
| `LIVE_ANSWERS` | Set to `off` to serve only the saved example answers |

Rebuild the dataset: `python scripts/fetch_sources.py`, `node data/build-records.mjs`, `python scripts/check_quotes.py`, then `cd studio && npx sanity dataset import ../data/records.ndjson production --replace`.

## Sanity project

Project `qnl9jh8n`, dataset `production` (public). Studio: https://will-it-focus.sanity.studio

## License

MIT
