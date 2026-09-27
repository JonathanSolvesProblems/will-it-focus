# YouTube fields for the demo video

## Title

```
Will It Focus: An Autofocus Agent That Only Quotes the Manufacturer. 21 of 22 Quotes Word for Word
```

## Description

```
Will It Focus answers one question: will this lens autofocus on this body, through this adapter? Every quote in the answer is checked by code against the manufacturer record it cites, so the agent can only say what Canon, Sigma or Metabones actually wrote.

Built for the DEV Sanity Challenge (Path One) on Sanity Context. One endpoint queries 131 typed documents with GROQ. A second reads a Knowledge Base of six manufacturer PDFs, including the 388-page Canon T5i manual. The question that started it: my T5i missed focus in auto mode, and page 100 of its manual explains why.

Measured on 20 questions graded by the manufacturers' own compatibility tables. With the Knowledge Base alone, 1 of 10 quotes came back word for word. With the typed dataset added, 21 of 22.

Try it: https://will-it-focus.vercel.app
Code (MIT): https://github.com/JonathanSolvesProblems/will-it-focus
Write-up: https://jonathanandrei.com/blog/will-it-focus-camera-autofocus-manufacturer-documents/

Chapters
0:00 My Canon T5i and page 100 of its manual
0:26 What Will It Focus answers
0:43 Two Sanity Context endpoints, 131 typed documents
1:06 The Sigma question a keyword search cannot answer
1:26 The Knowledge Base: six PDFs, ten entries
2:00 The quote gate, enforced in code
2:32 No manufacturer record, no verdict
2:49 21 of 22 quotes, word for word
3:16 Two scripts that fail the build

Sources shown in the video
Canon EOS Rebel T5i / 700D instruction manual: https://gdlp01.c-wss.com/gds/5/0300010905/07/eos-rebelt5i-700d-im7-en.pdf
Sigma MC-11 lens compatibility table: https://www.sigma-global.com/en/support/download/SIGMA_MC_11_lens_en.pdf
Metabones EF to E Smart Adapter Mark V: https://www.metabones.com/products/details/mb-ef-e-bt5
Eval results and grading script: https://github.com/JonathanSolvesProblems/will-it-focus/tree/main/eval

Stack: Sanity Context (GROQ and Knowledge Base endpoints), Sanity Studio, Next.js 16, Vercel AI SDK, OpenAI gpt-5.4-mini, Vercel.

More projects: https://jonathansolvesproblems.com
```

## Tags

```
will it focus, sanity, sanity context, sanity challenge, dev challenge, ai agent, mcp, groq, knowledge base, rag, structured content, camera autofocus, lens compatibility, canon t5i, sigma mc-11, metabones, hackathon, next.js, vercel ai sdk, openai, jonathansolvesproblems
```

## Thumbnail

```
shots/thumb/will-it-focus-h.jpg
```

## Notes (nothing above this line is commentary)

- Title is 98 characters (limit 100). Tags are 272 characters (limit 500). No emoji, no em dashes.
- Chapters were read from broll/demo.edit-plan.json plus the 3.5 s title card and match the 3:38 render.
- After the DEV post is published, add one line under the code link: `Write-up on DEV: <post url>`.
- Every number in the description is one that scripts/check_claims.py verifies in the post and README.
- Thumbnail H is the two-card version (film frame behind, app answer in front) rendered by shots/thumb/composite.py. A through G and I are the alternates in the same folder.
