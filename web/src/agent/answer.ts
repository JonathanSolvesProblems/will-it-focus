import {Output, generateText, isStepCount} from 'ai'
import {INSTRUCTIONS, MODEL, connectContext, model} from './focusAgent'
import {type CheckedVerdict, checkVerdict, verdictSchema} from './verdict'

const STRUCTURED = `

Return the verdict as structured output. For every finding that rests on a dataset record, give its _id as recordId. Put text in quote only when it is copied character for character from that record's source.quote; a server check compares it with the record, and anything that does not match is shown to the user as unverified. Knowledge base points go in point with kbEntry set and quote null.`

export type Step = {tool: string; detail: string | null}

// One agent run: Sanity Context tools in, a checked verdict out. Shared by the route and the scripts.
export async function answer(question: string, onStep: (s: Step) => void = () => {}): Promise<CheckedVerdict & {model: string}> {
  const ctx = await connectContext()
  try {
    const result = await generateText({
      model: model(),
      instructions: INSTRUCTIONS + STRUCTURED,
      prompt: question,
      tools: ctx.tools,
      output: Output.object({schema: verdictSchema}),
      // Cost ceilings: a bounded number of tool rounds and bounded output per step.
      stopWhen: isStepCount(10),
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
