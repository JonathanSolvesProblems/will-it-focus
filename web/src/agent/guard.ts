// Everything that stands between a stranger and the OpenAI bill. Each check fails closed.

export type Refusal = {status: number; message: string}

// 1. The question has to be about camera focus at all. Deterministic, costs nothing.
const TERMS =
  /\b(canon|nikon|sony|sigma|tamron|tokina|fuji(film)?|panasonic|lumix|olympus|om[- ]system|leica|pentax|metabones|viltrox|samyang|rokinon|rebel|eos|alpha|ef-?s?|ef-?m|rf|mc-?11|lens(es)?|\d+(\.\d+)?\s?mm|f\/\d|af[- ]?[sc]?|autofocus|focus(ing)?|mount|adapter|stm|usm|hsm|dslr|mirrorless|camera|body|kit)\b/gi

export function onTopic(question: string): Refusal | null {
  const hits = new Set((question.match(TERMS) ?? []).map((t) => t.toLowerCase()))
  if (hits.size >= 2) return null
  return {status: 422, message: 'Ask about a camera body and a lens, for example "Canon T5i with the 18-55 STM, video".'}
}

// 2. Per visitor: a few live answers per ten minutes. Per server instance, so it is a speed bump;
//    the daily cap below is the real ceiling.
const WINDOW_MS = 10 * 60 * 1000
const PER_WINDOW = 4
const seen = new Map<string, number[]>()

export function perVisitor(ip: string): Refusal | null {
  const now = Date.now()
  const recent = (seen.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= PER_WINDOW) {
    return {status: 429, message: 'That is four live answers in ten minutes. The example questions still answer instantly.'}
  }
  seen.set(ip, [...recent, now])
  if (seen.size > 5000) seen.clear()
  return null
}

// 3. Concurrency: at most a few agent runs at once per instance.
let inFlight = 0
const MAX_IN_FLIGHT = 3
export function acquireSlot(): Refusal | null {
  if (inFlight >= MAX_IN_FLIGHT) return {status: 503, message: 'Busy right now. Try an example question, or ask again in a minute.'}
  inFlight++
  return null
}
export const releaseSlot = () => {
  inFlight = Math.max(0, inFlight - 1)
}

// 4. A hard daily ceiling shared by every instance, counted atomically in Sanity.
//    The id contains dots, so the counter is private: it is never served by the public API.
export async function dailyBudget(): Promise<Refusal | null> {
  const token = process.env.SANITY_WRITE_TOKEN
  const limit = Number(process.env.DAILY_LIVE_LIMIT ?? 60)
  const closed = {status: 503, message: 'Live answers are off for today to keep this demo free to run. The example questions still work.'}
  if (!token || !(limit > 0)) return closed
  const id = `private.usage.${new Date().toISOString().slice(0, 10)}`
  const project = process.env.SANITY_PROJECT_ID ?? 'qnl9jh8n'
  try {
    const res = await fetch(`https://${project}.api.sanity.io/v2025-02-19/data/mutate/production?returnDocuments=true`, {
      method: 'POST',
      headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({
        mutations: [{createIfNotExists: {_id: id, _type: 'usageCounter', count: 0}}, {patch: {id, inc: {count: 1}}}],
      }),
      cache: 'no-store',
    })
    if (!res.ok) return closed
    const {results} = (await res.json()) as {results: {document?: {count?: number}}[]}
    const count = results.at(-1)?.document?.count ?? Infinity
    return count > limit ? closed : null
  } catch {
    return closed
  }
}

export function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown'
}
