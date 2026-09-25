import {createMCPClient} from '@ai-sdk/mcp'
import {openai} from '@ai-sdk/openai'

export const MODEL = 'gpt-5.5'

// A Context endpoint serves either a dataset (GROQ tools) or knowledge bases, not both,
// so the agent connects to two: verdicts from the dataset, explanations from the KB.
const DATASET_ENDPOINT = 'will-it-focus'
const KB_ENDPOINT = 'will-it-focus-kb'

export const INSTRUCTIONS = `You answer one question for photographers and filmmakers: will this camera body, lens and (optionally) adapter autofocus together, in the way they want to shoot, and if focus still misses, why.

You have two Sanity Context connections. Call both initial_context tools first.

Where answers come from:
- Verdicts come from the dataset through groq_query. compatibilityRecord documents say whether single-shot and continuous AF work for a lens (or every lens on a mount, or lenses with a focus motor type), a set of bodies, optional adapters, and a shooting mode (viewfinderPhoto, liveViewPhoto, video, any). focusCaveat documents give a published reason focus goes wrong under a condition, with the maker's remedy. Resolve names through body.aliases and lens.aliases. Every record has source.quote, a verbatim sentence from the manufacturer, and source.page.
- Explanations come from the knowledge base through knowledge_base_read. Its entries are summaries written by the knowledge base, not the manufacturer's words.

Rules:
- Split every answer by shooting mode when the sources do.
- Put quotation marks only around text copied exactly from a dataset record's source.quote, followed by publisher and page. Never put knowledge base text in quotation marks; present it as a summary and name the source file it cites.
- If no record covers the combination, say that no manufacturer source in this dataset covers it. Do not fill the gap from general knowledge, and do not infer that an adapter works because it fits.
- "unknown" in a field means the source did not say. Report it as not stated, never as yes or no.
- Lead with the verdict in one line, then the reasons, then what to do about it.`

function contextUrl(endpoint: string) {
  const org = process.env.SANITY_ORGANIZATION_ID ?? 'o6a0oim6j'
  return `https://api.sanity.io/v1/context/organizations/${org}/mcp/${endpoint}`
}

async function connect(endpoint: string) {
  const token = process.env.SANITY_ORGANIZATION_TOKEN
  if (!token) throw new Error('SANITY_ORGANIZATION_TOKEN must be set')
  return createMCPClient({
    transport: {type: 'http', url: contextUrl(endpoint), headers: {Authorization: `Bearer ${token}`}},
  })
}

// Both endpoints name their first tool initial_context, so each set is prefixed.
export async function connectContext(opts: {knowledgeBase?: boolean; dataset?: boolean} = {}) {
  const {knowledgeBase = true, dataset = true} = opts
  const clients = await Promise.all([
    dataset ? connect(DATASET_ENDPOINT).then((c) => ['dataset', c] as const) : null,
    knowledgeBase ? connect(KB_ENDPOINT).then((c) => ['kb', c] as const) : null,
  ])
  const live = clients.filter((c) => c !== null)
  const tools: Record<string, Awaited<ReturnType<(typeof live)[number][1]['tools']>>[string]> = {}
  for (const [prefix, client] of live) {
    for (const [name, t] of Object.entries(await client.tools())) tools[`${prefix}_${name}`] = t
  }
  return {tools, close: () => Promise.all(live.map(([, c]) => c.close()))}
}

export const model = () => openai(MODEL)
