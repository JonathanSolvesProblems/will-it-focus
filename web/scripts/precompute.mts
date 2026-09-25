// Saves real agent answers for the example questions into src/data/examples.json.
//   npx tsx --env-file=.env.local scripts/precompute.mts
// Each saved answer records the model and time, and the page says it is a saved answer.
import {writeFileSync} from 'node:fs'
import {answer, type Step} from '../src/agent/answer.ts'
import {MODEL} from '../src/agent/focusAgent.ts'
import {EXAMPLE_QUESTIONS} from '../src/data/exampleQuestions.ts'

const answers = []
for (const question of EXAMPLE_QUESTIONS) {
  const steps: Step[] = []
  const verdict = await answer(question, (s) => steps.push(s))
  console.log(`${question}\n  ${verdict.headline}\n  quotes ${verdict.checks.verified}/${verdict.checks.quotes} verified`)
  answers.push({question, steps, verdict, generatedAt: new Date().toISOString()})
}
writeFileSync(new URL('../src/data/examples.json', import.meta.url), JSON.stringify({model: MODEL, answers}, null, 2) + '\n')
