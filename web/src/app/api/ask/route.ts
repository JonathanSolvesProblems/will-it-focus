import {Output, generateText, isStepCount} from 'ai'
import {INSTRUCTIONS, connectContext, model} from '@/agent/focusAgent'
import {checkVerdict, verdictSchema} from '@/agent/verdict'

export const maxDuration = 120

const STRUCTURED = `

Return the verdict as structured output. For every finding that rests on a dataset record, give its _id as recordId. Put text in quote only when it is copied character for character from that record's source.quote; a server check compares it with the record, and anything that does not match is shown to the user as unverified. Knowledge base points go in point with kbEntry set and quote null.`

// Streams newline-delimited JSON: progress events while the agent works, then the checked verdict.
export async function POST(req: Request) {
  const {question} = (await req.json()) as {question?: string}
  if (!question || question.trim().length < 4 || question.length > 500) {
    return Response.json({error: 'Ask about a camera body and a lens, in under 500 characters.'}, {status: 400})
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'))
      const ctx = await connectContext().catch((error) => {
        send({type: 'error', message: `Could not reach Sanity Context: ${String(error)}`})
        return null
      })
      if (!ctx) return controller.close()
      try {
        const result = await generateText({
          model: model(),
          instructions: INSTRUCTIONS + STRUCTURED,
          prompt: question,
          tools: ctx.tools,
          output: Output.object({schema: verdictSchema}),
          stopWhen: isStepCount(14),
          onStepEnd: (step) => {
            for (const call of step.toolCalls) {
              const input = call.input as {query?: string; paths?: string[]}
              send({type: 'step', tool: call.toolName, detail: input.query ?? input.paths?.join(', ') ?? null})
            }
          },
        })
        send({type: 'checking'})
        send({type: 'verdict', verdict: await checkVerdict(result.output)})
      } catch (error) {
        send({type: 'error', message: String(error)})
      } finally {
        await ctx.close()
        controller.close()
      }
    },
  })
  return new Response(stream, {headers: {'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store'}})
}
