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

async function contextTools(endpoint: string) {
  const org = process.env.SANITY_ORGANIZATION_ID ?? 'o6a0oim6j'
  const res = await fetch(`https://api.sanity.io/v1/context/organizations/${org}/mcp/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SANITY_ORGANIZATION_TOKEN ?? ''}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({jsonrpc: '2.0', id: 1, method: 'tools/list'}),
    cache: 'no-store',
  })
  const body = (await res.json()) as {result?: {tools: {name: string}[]}; error?: {message: string}}
  if (!res.ok || !body.result) throw new Error(body.error?.message ?? `HTTP ${res.status}`)
  return body.result.tools.map((t) => t.name).join(',')
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
    contextDataset: await timed(() => contextTools('will-it-focus')),
    contextKnowledgeBase: await timed(() => contextTools('will-it-focus-kb')),
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
