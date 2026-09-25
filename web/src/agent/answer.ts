import {Output, generateText, isStepCount} from 'ai'
import {INSTRUCTIONS, MODEL, connectContext, model} from './focusAgent'
import {type CheckedVerdict, checkVerdict, verdictSchema} from './verdict'

const STRUCTURED = `

Return the verdict as structured output. For every finding that rests on a dataset record, give its _id as recordId. Put text in quote only when it is copied character for character from that record's source.quote; a server check compares it with the record, and anything that does not match is shown to the user as unverified. Knowledge base points go in point with kbEntry set and quote null.`

export type Step = {tool: string; detail: string | null}

// One agent run: Sanity Context tools in, a checked verdict out. Shared by the route and the scripts.
// Per-run ceiling on tokens read. A normal question uses 25-60k; a question crafted to make the
// agent run huge queries hits this instead of the bill.
const TOKEN_BUDGET = 150_000

export async function answer(
  question: string,
  onStep: (s: Step) => void = () => {},
  abortSignal?: AbortSignal,
): Promise<CheckedVerdict & {model: string}> {
  const ctx = await connectContext()
  try {
    const result = await generateText({
      model: model(),
      instructions: INSTRUCTIONS + STRUCTURED,
      prompt: question,
      tools: ctx.tools,
      output: Output.object({schema: verdictSchema}),
      abortSignal,
      // Cost ceilings: bounded tool rounds, bounded output per step, bounded total input.
      stopWhen: [
        isStepCount(10),
        ({steps}) => steps.reduce((sum, s) => sum + (s.usage.inputTokens ?? 0), 0) > TOKEN_BUDGET,
      ],
      maxOutputTokens: 4000,
      onStepEnd: (step) => {
        for (const call of step.toolCalls) {
          const input = call.input as {query?: string; paths?: string[]}
          onStep({tool: call.toolName, detail: input.query ?? input.paths?.join(', ') ?? null})
        }
      },
    })
    return {...(await checkVerdict(result.output)), model: MODEL}
  } finally {
    await ctx.close()
  }
}
