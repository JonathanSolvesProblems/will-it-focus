import examples from '@/data/examples.json'

// For an uptime monitor during the judging window. Checks every dependency a visitor's
// answer needs except the model, so it costs nothing to poll. 503 if any dependency fails.
export const dynamic = 'force-dynamic'

type Check = {ok: boolean; ms: number; detail?: string}

async function timed(fn: () => Promise<string | void>): Promise<Check> {
  const started = Date.now()
  try {
    const detail = await fn()
    return {ok: true, ms: Date.now() - started, ...(detail ? {detail} : {})}
  } catch (error) {
    return {ok: false, ms: Date.now() - started, detail: String(error).slice(0, 120)}
  }
}

// A real tool call through Sanity Context, the same path a visitor's answer takes.
async function contextCall(endpoint: string, tool: string, args: object) {
  const org = process.env.SANITY_ORGANIZATION_ID ?? 'o6a0oim6j'
  const res = await fetch(`https://api.sanity.io/v1/context/organizations/${org}/mcp/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SANITY_ORGANIZATION_TOKEN ?? ''}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({jsonrpc: '2.0', id: 1, method: 'tools/call', params: {name: tool, arguments: args}}),
    cache: 'no-store',
  })
  const body = (await res.json()) as {result?: {content: {text?: string}[]; isError?: boolean}; error?: {message: string}}
  if (!res.ok || !body.result || body.result.isError) throw new Error(body.error?.message ?? body.result?.content[0]?.text?.slice(0, 100) ?? `HTTP ${res.status}`)
  return body.result.content.map((c) => c.text ?? '').join('')
}

// The daily counter needs write access. An idempotent write proves the token still has it,
// which matters if the project's plan changes and the token's role with it.
async function counterWrite() {
  const project = process.env.SANITY_PROJECT_ID ?? 'qnl9jh8n'
  const token = process.env.SANITY_WRITE_TOKEN
  if (!token) throw new Error('missing')
  const res = await fetch(`https://${project}.api.sanity.io/v2025-02-19/data/mutate/production`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({mutations: [{createIfNotExists: {_id: 'private.usage.health', _type: 'usageCounter', count: 0}}]}),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export async function GET() {
  const project = process.env.SANITY_PROJECT_ID ?? 'qnl9jh8n'
  const checks = {
    dataset: await timed(async () => {
      const res = await fetch(
        `https://${project}.api.sanity.io/v2025-02-19/data/query/production?query=count(*%5B_type%3D%3D%22compatibilityRecord%22%5D)`,
        {cache: 'no-store'},
      )
      const {result} = (await res.json()) as {result: number}
      if (!res.ok || !(result > 0)) throw new Error(`records: ${result}`)
      return `${result} compatibility records`
    }),
    contextDataset: await timed(async () => {
      const text = await contextCall('will-it-focus', 'groq_query', {query: 'count(*[_type == "compatibilityRecord"])'})
      const n = Number(text.match(/\d+/)?.[0])
      if (!(n > 0)) throw new Error(`groq through Context returned: ${text.slice(0, 80)}`)
      return `groq_query counted ${n} records`
    }),
    contextKnowledgeBase: await timed(async () => {
      const text = await contextCall('will-it-focus-kb', 'knowledge_base_read', {knowledgeBase: 'kb4LQhif6kkH', paths: ['lens_autofocus']})
      if (text.length < 500) throw new Error(`entry too short: ${text.length} chars`)
      return `knowledge_base_read returned ${text.length} chars`
    }),
    usageCounterWrite: await timed(counterWrite),
    savedAnswers: await timed(async () => {
      if (examples.answers.length === 0) throw new Error('none saved')
      return `${examples.answers.length} saved`
    }),
    openaiKey: await timed(async () => {
      if (!process.env.OPENAI_API_KEY) throw new Error('missing')
    }),
  }
  const ok = Object.values(checks).every((c) => c.ok)
  return Response.json(
    {ok, liveAnswers: process.env.LIVE_ANSWERS === 'off' ? 'off' : 'on', checkedAt: new Date().toISOString(), checks},
    {status: ok ? 200 : 503, headers: {'Cache-Control': 'no-store'}},
  )
}
