import {answer} from '@/agent/answer'
import {acquireSlot, clientIp, dailyBudget, onTopic, perVisitor, releaseSlot} from '@/agent/guard'
import {checkVerdict, type Verdict} from '@/agent/verdict'
import examples from '@/data/examples.json'

export const maxDuration = 120

type Saved = {question: string; verdict: Verdict & {model?: string}; steps: {tool: string; detail: string | null}[]}
const normalise = (q: string) => q.toLowerCase().replace(/\s+/g, ' ').trim()
const saved = new Map((examples.answers as Saved[]).map((a) => [normalise(a.question), a]))

// Internal errors are logged, never sent: they can carry configuration or upstream detail.
const PUBLIC_ERROR = 'Something went wrong reaching the sources. Try again in a minute, or try an example question.'

function ndjson(run: (send: (event: object) => void) => Promise<void>) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'))
      try {
        await run(send)
      } catch (error) {
        console.error('ask failed', error)
        send({type: 'error', message: PUBLIC_ERROR})
      } finally {
        controller.close()
      }
    },
  })
  return new Response(stream, {headers: {'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store'}})
}

const refuse = (r: {status: number; message: string}) => Response.json({error: r.message}, {status: r.status})

// Order matters: free checks first, the paid call last.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {question?: unknown}
  const question = typeof body.question === 'string' ? body.question.trim() : ''
  if (question.length < 4) return refuse({status: 400, message: 'Ask about a camera body and a lens.'})
  if (question.length > 300) return refuse({status: 400, message: 'Ask in under 300 characters.'})

  // Saved answers to the example questions: instant and free, but re-checked against the
  // records as they are now, so a saved answer cannot outlive a correction to the data.
  const hit = saved.get(normalise(question))
  if (hit) {
    return ndjson(async (send) => {
      for (const s of hit.steps) send({type: 'step', ...s, replay: true})
      send({type: 'verdict', verdict: {...(await checkVerdict(hit.verdict)), model: hit.verdict.model}, saved: true})
    })
  }

  if (process.env.LIVE_ANSWERS === 'off') {
    return refuse({status: 503, message: 'Live answers are switched off. The example questions still work.'})
  }
  const blocked = onTopic(question) ?? perVisitor(clientIp(req))
  if (blocked) return refuse(blocked)
  const acquired = acquireSlot()
  if (!('slot' in acquired)) return refuse(acquired)

  const overBudget = await dailyBudget()
  if (overBudget) {
    releaseSlot(acquired.slot)
    return refuse(overBudget)
  }

  // Stop paying when the visitor leaves, and before the platform's own timeout.
  const signal = AbortSignal.any([req.signal, AbortSignal.timeout(100_000)])
  return ndjson(async (send) => {
    try {
      const verdict = await answer(question, (s) => send({type: 'step', ...s}), signal)
      send({type: 'checking'})
      send({type: 'verdict', verdict})
    } finally {
      releaseSlot(acquired.slot)
    }
  })
}
