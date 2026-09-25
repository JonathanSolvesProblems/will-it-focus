// Runs eval/questions.json under three conditions and saves every answer.
//   npx tsx --env-file=../.env.local eval/run.mts [--only kb|dataset|both]
// Same model, same instructions, same questions; only the Sanity Context sources differ.
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {generateText, isStepCount} from 'ai'
import {INSTRUCTIONS, MODEL, connectContext, model} from '../src/agent/focusAgent.ts'

const ROOT = new URL('../../', import.meta.url)
const {questions} = JSON.parse(readFileSync(new URL('eval/questions.json', ROOT), 'utf8'))

const CONDITIONS = {
  kb: {knowledgeBase: true, dataset: false},
  dataset: {knowledgeBase: false, dataset: true},
  both: {knowledgeBase: true, dataset: true},
} as const
type Condition = keyof typeof CONDITIONS

// Appended for the eval only, so a verdict can be compared mechanically.
const VERDICT_FORMAT = `

After your answer, end with a fenced json block holding your verdict for exactly the fields the question asks about, chosen from singleAf, continuousAf, dmf. Each value is one of: "supported", "limited", "notSupported", "notCovered" (no source available to you says). Example:
\`\`\`json
{"singleAf": "supported", "continuousAf": "notSupported"}
\`\`\``

const only = process.argv.includes('--only') ? (process.argv[process.argv.indexOf('--only') + 1] as Condition) : null
const conditions = (Object.keys(CONDITIONS) as Condition[]).filter((c) => !only || c === only)

async function ask(condition: Condition, q: {id: string; question: string}) {
  const ctx = await connectContext(CONDITIONS[condition])
  const started = Date.now()
  try {
    const result = await generateText({
      model: model(),
      instructions: INSTRUCTIONS + VERDICT_FORMAT,
      prompt: q.question,
      tools: ctx.tools,
      stopWhen: isStepCount(12),
    })
    const calls = result.steps.flatMap((s) => s.toolCalls.map((c) => c.toolName))
    return {text: result.text, calls, tokens: result.usage.totalTokens, ms: Date.now() - started}
  } catch (error) {
    return {text: '', error: String(error), calls: [], tokens: 0, ms: Date.now() - started}
  } finally {
    await ctx.close()
  }
}

// A few at a time: enough to finish in minutes, few enough to stay under rate limits.
async function pool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>) {
  const out: R[] = []
  let next = 0
  await Promise.all(
    Array.from({length: size}, async () => {
      while (next < items.length) {
        const i = next++
        out[i] = await fn(items[i])
      }
    }),
  )
  return out
}

// --ids q05,q06 re-runs just those questions (e.g. after a rate-limit error).
const ids = process.argv.includes('--ids') ? process.argv[process.argv.indexOf('--ids') + 1].split(',') : null
const jobs = conditions.flatMap((condition) =>
  questions.filter((q: {id: string}) => !ids || ids.includes(q.id)).map((q: {id: string; question: string}) => ({condition, q})),
)
const runs = await pool(jobs, 4, async ({condition, q}) => {
  const r = await ask(condition, q)
  const dir = new URL(`eval/results/${condition}/`, ROOT)
  mkdirSync(dir, {recursive: true})
  writeFileSync(new URL(`${q.id}.md`, dir), r.text)
  console.log(`${condition.padEnd(7)} ${q.id} ${r.error ? 'ERROR ' + r.error.slice(0, 80) : `${r.calls.length} calls, ${r.tokens} tokens`}`)
  return {condition, id: q.id, ...r, text: undefined}
})

// A partial re-run writes its own log so the full run's record is kept.
writeFileSync(
  new URL(ids ? `eval/results/runs-rerun-${ids.join('-')}.json` : 'eval/results/runs.json', ROOT),
  JSON.stringify({model: MODEL, ranAt: new Date().toISOString(), runs}, null, 2),
)
