import {answer} from '@/agent/answer'
import {acquireSlot, clientIp, dailyBudget, onTopic, perVisitor, releaseSlot} from '@/agent/guard'
import examples from '@/data/examples.json'

export const maxDuration = 120

type Saved = {question: string; verdict: unknown; steps: {tool: string; detail: string | null}[]}
const normalise = (q: string) => q.toLowerCase().replace(/\s+/g, ' ').trim()
const saved = new Map((examples.answers as Saved[]).map((a) => [normalise(a.question), a]))

function ndjson(run: (send: (event: object) => void) => Promise<void>) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'))
      try {
        await run(send)
      } catch (error) {
        send({type: 'error', message: String(error)})
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
  if (question.length < 4 || question.length > 300) return refuse({status: 400, message: 'Ask in under 300 characters.'})

  // Saved answers to the example questions: instant, and free to serve.
  const hit = saved.get(normalise(question))
  if (hit) {
    return ndjson(async (send) => {
      for (const s of hit.steps) send({type: 'step', ...s, replay: true})
      send({type: 'verdict', verdict: hit.verdict, saved: true})
    })
  }

  if (process.env.LIVE_ANSWERS === 'off') {
    return refuse({status: 503, message: 'Live answers are switched off. The example questions still work.'})
  }
  const blocked = onTopic(question) ?? perVisitor(clientIp(req)) ?? acquireSlot()
  if (blocked) return refuse(blocked)

  const overBudget = await dailyBudget()
  if (overBudget) {
    releaseSlot()
    return refuse(overBudget)
  }

  return ndjson(async (send) => {
    try {
      const verdict = await answer(question, (s) => send({type: 'step', ...s}))
      send({type: 'checking'})
      send({type: 'verdict', verdict})
    } finally {
      releaseSlot()
    }
  })
}
