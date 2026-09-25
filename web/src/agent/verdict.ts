import {z} from 'zod'

const support = z
  .enum(['supported', 'limited', 'notSupported', 'notStated'])
  .describe('notStated when no record says. Never guess yes or no.')

export const verdictSchema = z.object({
  headline: z.string().describe('The verdict in one plain sentence.'),
  covered: z.boolean().describe('false when no manufacturer record in the dataset covers this combination'),
  notCoveredReason: z.string().nullable().describe('When covered is false: what is missing, plainly.'),
  modes: z.array(
    z.object({
      mode: z.enum(['viewfinderPhoto', 'liveViewPhoto', 'video', 'any']),
      singleAf: support,
      continuousAf: support,
      findings: z.array(
        z.object({
          point: z.string().describe('One plain-language reason, in your own words.'),
          recordId: z.string().nullable().describe('The _id of the dataset record this point rests on, exactly as returned by groq_query.'),
          quote: z
            .string()
            .nullable()
            .describe("The whole of that record's source.quote, copied character for character. null when the point comes from the knowledge base or no record has a quote for it."),
          kbEntry: z.string().nullable().describe('Knowledge base entry path, when the point is a knowledge base summary.'),
        }),
      ),
      remedy: z.string().nullable().describe('What the user can do, in your own words.'),
    }),
  ),
})
export type Verdict = z.infer<typeof verdictSchema>

type Source = {publisher: string | null; url: string | null; page: number | null; title: string | null}
export type CheckedFinding = Verdict['modes'][number]['findings'][number] & {
  verified: boolean
  // When the model's quote fails the check, the cited record's own sentence is shown in its place.
  recordQuote: string | null
  source: Source | null
}
// true: a cited record in this mode states the same value. false: none does. null: nothing to check.
export type Backing = {singleAf: boolean | null; continuousAf: boolean | null}
export type CheckedVerdict = Omit<Verdict, 'modes'> & {
  modes: (Omit<Verdict['modes'][number], 'findings'> & {findings: CheckedFinding[]; backed: Backing})[]
  checks: {quotes: number; verified: number}
}

type SourceRow = {publisher?: string; url?: string; page?: number; title?: string; quote?: string}
type RecordRow = {_id: string; _type: string; shootingMode?: string; singleAf?: string; continuousAf?: string; sources: SourceRow[] | null}

const squash = (s: string) =>
  s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[\s•●​*"]+/g, '').replace(/[.:;,]+$/, '')

// The spans a quote may legitimately be: the whole source quote, or any run of its whole sentences.
// A fragment, or a sentence with its condition cut off, does not count.
function spans(quote: string): string[] {
  const sentences = quote.split(/(?<=[.!?:])\s+/).filter(Boolean)
  const out = [quote]
  for (let i = 0; i < sentences.length; i++) {
    for (let j = i + 1; j <= sentences.length; j++) out.push(sentences.slice(i, j).join(' '))
  }
  return out.map(squash)
}

function matches(modelQuote: string, sourceQuote: string) {
  const q = squash(modelQuote)
  return q.length >= 10 && spans(sourceQuote).includes(q)
}

// The source whose wording is closest to what the model tried to quote.
function closest(modelQuote: string, rows: SourceRow[]) {
  const words = new Set(modelQuote.toLowerCase().match(/[a-z0-9]+/g) ?? [])
  const score = (r: SourceRow) => (r.quote?.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((w) => words.has(w)).length
  return rows.filter((r) => r.quote).sort((a, b) => score(b) - score(a))[0]
}

// Fetch the cited records straight from the public dataset. The gate trusts these, not the model.
async function fetchRecords(ids: string[]): Promise<Map<string, RecordRow>> {
  if (ids.length === 0) return new Map()
  const project = process.env.SANITY_PROJECT_ID ?? 'qnl9jh8n'
  const query = '*[_id in $ids]{_id, _type, shootingMode, singleAf, continuousAf, "sources": select(defined(source) => [source], sources)}'
  const url = new URL(`https://${project}.api.sanity.io/v2025-02-19/data/query/production`)
  url.searchParams.set('query', query)
  url.searchParams.set('$ids', JSON.stringify(ids))
  const res = await fetch(url, {cache: 'no-store'})
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`)
  const {result} = (await res.json()) as {result: RecordRow[]}
  return new Map(result.map((r) => [r._id, r]))
}

const STATE_FIELD = {supported: 'supported', limited: 'limited', notSupported: 'notSupported'} as const

export async function checkVerdict(v: Verdict): Promise<CheckedVerdict> {
  const ids = [...new Set(v.modes.flatMap((m) => m.findings.map((f) => f.recordId).filter((x): x is string => !!x)))]
  const records = await fetchRecords(ids)
  let quotes = 0
  let verified = 0

  const modes = v.modes.map((m) => {
    const cited = m.findings.map((f) => (f.recordId ? records.get(f.recordId) : undefined)).filter((r): r is RecordRow => !!r)
    const inMode = cited.filter((r) => r._type === 'compatibilityRecord' && (r.shootingMode === m.mode || r.shootingMode === 'any' || m.mode === 'any'))
    const backs = (field: 'singleAf' | 'continuousAf') =>
      m[field] === 'notStated' ? null : inMode.some((r) => r[field] === STATE_FIELD[m[field] as keyof typeof STATE_FIELD])

    const findings = m.findings.map((f): CheckedFinding => {
      const rows = (f.recordId ? records.get(f.recordId)?.sources : null) ?? []
      const match = f.quote ? rows.find((r) => r.quote && matches(f.quote!, r.quote)) : undefined
      if (f.quote) {
        quotes++
        if (match) verified++
      }
      const fallback = f.quote && !match ? closest(f.quote, rows) : undefined
      const row = match ?? fallback ?? rows[0]
      return {
        ...f,
        verified: !!match,
        recordQuote: fallback?.quote ?? null,
        source: row ? {publisher: row.publisher ?? null, url: row.url ?? null, page: row.page ?? null, title: row.title ?? null} : null,
      }
    })
    return {...m, findings, backed: {singleAf: backs('singleAf'), continuousAf: backs('continuousAf')}}
  })
  return {...v, modes, checks: {quotes, verified}}
}
