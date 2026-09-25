---
title: "Will It Focus: 21 of 22 Quotes Word for Word From the Manufacturer's Own Documents"
published: false
tags: devchallenge, sanitychallenge, sanity, ai
cover_image: https://raw.githubusercontent.com/JonathanSolvesProblems/will-it-focus/main/submission/images/verdict-sigma.png
---

*This is a submission for the [Sanity Challenge, Path One: Ship an Agent That Queries Real Content](https://dev.to/challenges/sanity-2026-09-16)*

## What I Built

When I was working in film, my Canon T5i would sometimes have trouble focusing in auto mode, and I often just switched to manual and did it myself.

Canon's own manual explains it. Page 100: "In Basic Zone modes, the camera will normally focus the closest subject automatically. Therefore, it may not always focus your target subject."

Will It Focus is an agent that answers that kind of question for any body, lens and adapter in its dataset: will they autofocus together, separately for viewfinder photos, live view and video, and if focus still misses, why. It works across mounts and adapters, so "Sigma 35mm Art on a Sony a7 IV through the MC-11: does AF-C work?" gets a real answer too.

The rule it lives by: a quote is only shown as the manufacturer's words if it is. Every quote the agent returns is looked up in the Sanity record it cites, by code, after the model is done. If it matches a whole sentence of that record, it lines up like a split-image focusing screen coming into focus. If the model reworded it, the page says so and shows the record's actual sentence underneath. If no manufacturer covers the combination, it refuses instead of guessing that an adapter that fits will also focus.

## Demo

Live, no login: **https://will-it-focus.vercel.app**

The four example questions are saved answers, so they load instantly. Type your own for a live run through Sanity Context.

![The verdict for a Sigma lens on a Sony body through the MC-11: AF-S works, AF-C does not, and Sigma's own table row is quoted and verified](https://raw.githubusercontent.com/JonathanSolvesProblems/will-it-focus/main/submission/images/verdict-sigma.png)

The Sigma answer above quotes the actual row from Sigma's MC-11 compatibility table, `35mm F1.4 DG HSM ○ × ×`, with a link to the page it came from.

![A Nikon F lens on a Canon RF body: no manufacturer record covers it, so there is no verdict](https://raw.githubusercontent.com/JonathanSolvesProblems/will-it-focus/main/submission/images/refusal.png)

And this is what happens when nobody has published an answer. No verdict.

## Code

https://github.com/JonathanSolvesProblems/will-it-focus

- `studio/schemaTypes/`: the schema
- `data/build-records.mjs`: builds every record from its source, with the verbatim quote
- `scripts/check_quotes.py`: fails if any quote in the dataset is not on the stated page of the manufacturer's PDF
- `web/src/agent/`: the agent, the quote gate and the cost guards
- `eval/`: 20 questions, three runs each, and every answer the agent gave

## How I Used Sanity

**Two Sanity Context endpoints, one agent.** The agent connects to both over MCP:

- `will-it-focus` serves the dataset in GROQ mode. This is where verdicts come from.
- `will-it-focus-kb` serves a Knowledge Base built from six manufacturer PDFs: the T5i manual (388 pages), both 18-55 kit lens instruction sheets, Canon Canada's 2013 T5i launch release, and Sigma's two MC-11 compatibility tables. Each file counted as one document against the 150 limit, including the 388-page manual.

I started with one endpoint and attached both sources. Saving the dataset replaced the Knowledge Base rather than adding to it, so I split them. Both tool sets get a prefix so the agent can tell `dataset_initial_context` from `kb_initial_context`.

**The schema.** 131 documents across seven types: 35 bodies, 34 lenses, 10 mounts, 5 adapters, 3 sensor formats, 36 compatibility records and 8 focus caveats. A few decisions that turned out to matter:

- Autofocus is split by how you shoot (`viewfinderPhoto`, `liveViewPhoto`, `video`), because the same body focuses with different hardware in each.
- A compatibility record is only as wide as its source. Canon's note on the 18-55 STM names four bodies, so the record references four bodies. When Sigma's table does not name bodies, the record references none, which the agent reads as "not limited to particular bodies."
- Every field a source might not state accepts "not stated by any source". A schema that forces yes or no forces the model to guess.
- Each fact carries a `source` object: URL, publisher, page, retrieved date, and the exact sentence it rests on.

**Where the Knowledge Base fits.** It is good at explaining. It rewrote the T5i manual into ten navigable entries, and the agent uses them for the why. It also rewrites, which is its job, so an entry is a summary and not Canon's words. The page labels every Knowledge Base point that way. The first time I ran the agent on the Knowledge Base alone, it put quotation marks around 13 sentences, and none of them are in Canon's manual. That is what pushed me to keep the verbatim text in typed records.

**Measured.** 20 questions whose answers are in Sigma's, Canon's and Metabones' own tables and manuals, run three ways on gpt-5.4-mini:

| Sanity Context sources | Verdicts matching the manufacturer | Quoted passages found word for word in a manufacturer document |
|---|---|---|
| Knowledge Base only | 37 of 43 | 1 of 10 |
| Dataset only | 39 of 43 | 28 of 31 |
| Both (what the app runs) | 38 of 43 | 21 of 22 |

The verdicts are close either way. The difference is whether the words in quotation marks belong to the manufacturer.

**The schema fixes the eval found.** Two of my own mistakes showed up in the numbers:

- I first stored Sigma's DMF column inside a free-text note. The agent could not query it and answered "not covered" on every DMF question. It is now a typed field.
- The smaller model missed records because "Sony a7 IV" did not match the alias "a7 IV", and it then guessed an id. Bodies and lenses now carry the names people actually type, and the agent is told never to construct an id. Most of its misses went away, which is how the dataset-only row above got to 39 of 43.

**What it does not do.** The gate proves a quote is in the record it cites, and checks each AF state against the cited records. It does not prove the agent cited the right record for your exact combination. The dataset is small: the T5i era of Canon, Sigma's MC-11, Metabones' Mark V and Canon's EF-EOS R adapter. Five flange distances come from Wikipedia because no manufacturer page states them, and those records say so.

## Sanity Project Details

- Project ID: `qnl9jh8n`
- Dataset: `production` (public). Example: [every compatibility record](https://qnl9jh8n.api.sanity.io/v2025-02-19/data/query/production?query=*%5B_type%3D%3D%22compatibilityRecord%22%5D)
- Studio: https://will-it-focus.sanity.studio
