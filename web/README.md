# web

The Next.js app: the page, the agent, the quote gate and the cost guards. See the [root README](../README.md) for what it is and how to run it.

- `src/agent/focusAgent.ts`: instructions and the two Sanity Context connections
- `src/agent/answer.ts`: one agent run, structured output, token and step budgets
- `src/agent/verdict.ts`: the gate that checks every quote against the record it cites
- `src/agent/guard.ts`: topic gate, per-visitor limit, run slots, daily cap
- `src/app/api/ask/route.ts`: the endpoint, saved answers first, paid run last
- `src/app/api/health/route.ts`: dependency check for an uptime monitor
- `scripts/precompute.mts`: saves the example answers into `src/data/examples.json`
- `scripts/test-gate.mts`: gate tests, public reads only
- `eval/run.mts`: runs `eval/questions.json` under three source settings
