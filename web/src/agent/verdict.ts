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
            .describe("Copied character for character from that record's source.quote. null when the point comes from the knowledge base or no record has a quote for it."),
          kbEntry: z.string().nullable().describe('Knowledge base entry path, when the point is a knowledge base summary.'),
        }),
      ),
      remedy: z.string().nullable().describe("The maker's own fix, when a record gives one."),
    }),
  ),
})
export type Verdict = z.infer<typeof verdictSchema>

export type CheckedFinding = Verdict['modes'][number]['findings'][number] & {
  verified: boolean
  // When the model's quote fails the check but the cited record has its own quote,
  // the record's words are shown in its place, so the user still gets the manufacturer's sentence.
  recordQuote: string | null
  source: {publisher: string | null; url: string | null; page: number | null; title: string | null} | null
}
export type CheckedVerdict = Omit<Verdict, 'modes'> & {
  modes: (Omit<Verdict['modes'][number], 'findings'> & {findings: CheckedFinding[]})[]
  checks: {quotes: number; verified: number}
}

type SourceRow = {publisher?: string; url?: string; page?: number; title?: string; quote?: string}

const squash = (s: string) => s.replace(/[\s•●​*]+/g, '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"')

// Fetch the cited records straight from the public dataset. The gate trusts these, not the model.
async function recordSources(ids: string[]): Promise<Map<string, SourceRow[]>> {
  if (ids.length === 0) return new Map()
  const project = process.env.SANITY_PROJECT_ID ?? 'qnl9jh8n'
  const query = '*[_id in $ids]{_id, "sources": select(defined(source) => [source], sources)}'
  const url = new URL(`https://${project}.api.sanity.io/v2025-02-19/data/query/production`)
  url.searchParams.set('query', query)
  url.searchParams.set('$ids', JSON.stringify(ids))
  const res = await fetch(url, {cache: 'no-store'})
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`)
  const {result} = (await res.json()) as {result: {_id: string; sources: SourceRow[] | null}[]}
  return new Map(result.map((r) => [r._id, r.sources ?? []]))
}

// A quote is verified only if it appears verbatim in a source.quote of the record it cites.
// Every record quote was itself checked against the manufacturer PDF by scripts/check_quotes.py.
export async function checkVerdict(v: Verdict): Promise<CheckedVerdict> {
  const ids = [...new Set(v.modes.flatMap((m) => m.findings.map((f) => f.recordId).filter((x): x is string => !!x)))]
  const sources = await recordSources(ids)
  let quotes = 0
  let verified = 0
  const modes = v.modes.map((m) => ({
    ...m,
    findings: m.findings.map((f): CheckedFinding => {
      const rows = f.recordId ? sources.get(f.recordId) : undefined
      const match = f.quote && rows ? rows.find((r) => r.quote && squash(r.quote).includes(squash(f.quote!))) : undefined
      if (f.quote) {
        quotes++
        if (match) verified++
      }
      const row = match ?? rows?.[0]
      return {
        ...f,
        verified: !!match,
        recordQuote: f.quote && !match ? (rows?.find((r) => r.quote)?.quote ?? null) : null,
        source: row ? {publisher: row.publisher ?? null, url: row.url ?? null, page: row.page ?? null, title: row.title ?? null} : null,
      }
    }),
  }))
  return {...v, modes, checks: {quotes, verified}}
}
