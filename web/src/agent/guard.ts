// Everything that stands between a stranger and the OpenAI bill. Each check fails closed.

export type Refusal = {status: number; message: string}

// 1. The question has to be about camera focus at all. Deterministic, costs nothing.
//    Two distinct hits: a brand, a part, a focus word, a focal length, or a model number
//    the way people type them (a7iv, a6400, 700d, t5i, gh5, z6, x-t5, 18-135, 1.8).
const TERMS =
  /\b(canon|nikon|sony|sigma|tamron|tokina|fuji(?:film)?|panasonic|lumix|olympus|om[- ]system|leica|pentax|metabones|viltrox|samyang|rokinon|rebel|eos|alpha|ef-?s?|ef-?m|rf|ftz|mc-?11|speed ?booster|lens(?:es)?|\d+(?:\.\d+)?\s?mm|\d{2,3}-\d{2,3}|f\/?\d(?:\.\d)?|\d\.\d|af[- ]?[sc]?|eye af|autofocus|focus(?:ing)?|hunt(?:ing|s)?|servo|video|movie|mount|adapter|stm|usm|hsm|dslr|mirrorless|camera|body|kit|[a-z]{1,3}-?\d{1,4}(?:[a-z]{1,3})?|\d{2,4}[a-z]{1,2})\b/gi

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
  if (seen.size > 5000) {
    for (const [k, times] of seen) if (times.every((t) => now - t >= WINDOW_MS)) seen.delete(k)
  }
  return null
}

// 3. Concurrency: at most a few agent runs at once per instance. Slots carry a start time and
//    expire, so a run killed by the platform before its finally block cannot hold one forever.
const MAX_IN_FLIGHT = 3
const SLOT_TTL_MS = 130_000
const slots = new Map<symbol, number>()
export function acquireSlot(): {slot: symbol} | Refusal {
  const now = Date.now()
  for (const [s, t] of slots) if (now - t > SLOT_TTL_MS) slots.delete(s)
  if (slots.size >= MAX_IN_FLIGHT) return {status: 503, message: 'Busy right now. Try an example question, or ask again in a minute.'}
  const slot = Symbol('run')
  slots.set(slot, now)
  return {slot}
}
export const releaseSlot = (slot: symbol) => {
  slots.delete(slot)
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
