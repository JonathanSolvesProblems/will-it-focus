// Saves real agent answers for the example questions into src/data/examples.json.
//   npx tsx --env-file=.env.local scripts/precompute.mts [--only 2,3]
// Each saved answer records the model and time, and the page says it is a saved answer.
// --only regenerates just those example indexes (one paid run each) and keeps the rest.
import {readFileSync, writeFileSync} from 'node:fs'
import {answer, type Step} from '../src/agent/answer.ts'
import {MODEL} from '../src/agent/focusAgent.ts'
import {EXAMPLE_QUESTIONS} from '../src/data/exampleQuestions.ts'

const file = new URL('../src/data/examples.json', import.meta.url)
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1].split(',').map(Number) : null
const existing = only ? (JSON.parse(readFileSync(file, 'utf8')) as {answers: {question: string}[]}).answers : []

const answers = []
for (const [i, question] of EXAMPLE_QUESTIONS.entries()) {
  const kept = only && !only.includes(i) ? existing.find((a) => a.question === question) : null
  if (kept) {
    answers.push(kept)
    continue
  }
  const steps: Step[] = []
  const verdict = await answer(question, (s) => steps.push(s))
  console.log(`${question}\n  ${verdict.headline}\n  quotes ${verdict.checks.verified}/${verdict.checks.quotes} verified`)
  answers.push({question, steps, verdict, model: MODEL, generatedAt: new Date().toISOString()})
}
writeFileSync(file, JSON.stringify({model: MODEL, answers}, null, 2) + '\n')
