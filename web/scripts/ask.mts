// End-to-end check without the UI:
//   npx tsx --env-file=../.env.local scripts/ask.mts [--kb-only | --dataset-only] "question"
import {generateText, isStepCount} from 'ai'
import {INSTRUCTIONS, connectContext, model} from '../src/agent/focusAgent.ts'

const args = process.argv.slice(2)
const kbOnly = args.includes('--kb-only')
const datasetOnly = args.includes('--dataset-only')
const question =
  args.filter((a) => !a.startsWith('--')).join(' ') || 'Why does my Canon T5i with the EF-S 18-55 IS STM hunt for focus?'

const ctx = await connectContext({knowledgeBase: !datasetOnly, dataset: !kbOnly})
try {
  console.log('tools:', Object.keys(ctx.tools).join(', '))
  const result = await generateText({
    model: model(),
    instructions: INSTRUCTIONS,
    prompt: question,
    tools: ctx.tools,
    stopWhen: isStepCount(12),
  })
  for (const step of result.steps) {
    for (const call of step.toolCalls) console.log(`> ${call.toolName} ${JSON.stringify(call.input).slice(0, 200)}`)
  }
  console.log('\n' + result.text)
  console.log(`\nsteps: ${result.steps.length}, tokens: ${result.usage.totalTokens}`)
} finally {
  await ctx.close()
}
