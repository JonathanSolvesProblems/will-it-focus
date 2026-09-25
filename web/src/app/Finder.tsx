'use client'

import {useEffect, useRef, useState} from 'react'
import type {CheckedFinding, CheckedVerdict} from '@/agent/verdict'

const EXAMPLES = [
  'Why does my Canon T5i with the EF-S 18-55 IS STM hunt for focus?',
  'Sigma 35mm F1.4 Art on a Sony a7 IV through the MC-11: AF-C and DMF?',
  'Canon EF 50mm f/1.8 II on a Sony body with the Metabones Mark V',
  'Nikon AF-S 50mm f/1.8G on a Canon EOS R6 with an F-to-RF adapter',
]

const MODE_NAME = {viewfinderPhoto: 'Viewfinder photo', liveViewPhoto: 'Live view', video: 'Video', any: 'Any mode'}
const STATE_WORD = {supported: 'Works', limited: 'With limits', notSupported: 'Does not work', notStated: 'Not stated'}
const TOOL_WORD: Record<string, string> = {
  dataset_initial_context: 'Opening the dataset',
  kb_initial_context: 'Opening the knowledge base',
  dataset_groq_query: 'Querying records with GROQ',
  dataset_schema_explorer: 'Reading the schema',
  dataset_array_field_reader: 'Reading a record field',
  kb_knowledge_base_read: 'Reading knowledge base entries',
}

type Phase = {kind: 'idle'} | {kind: 'working'; steps: string[]} | {kind: 'done'; verdict: CheckedVerdict} | {kind: 'error'; message: string}

export function Finder({measured}: {measured: {kb: [number, number]; both: [number, number]} | null}) {
  const [question, setQuestion] = useState('')
  const [phase, setPhase] = useState<Phase>({kind: 'idle'})
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  async function ask(q: string) {
    if (q.trim().length < 4) return
    setQuestion(q)
    setPhase({kind: 'working', steps: ['Starting']})
    try {
      const res = await fetch('/api/ask', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({question: q})})
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}))
        return setPhase({kind: 'error', message: body.error ?? `The server answered ${res.status}.`})
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
      let buffer = ''
      for (;;) {
        const {value, done} = await reader.read()
        if (done) break
        buffer += value
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines.filter(Boolean)) {
          const event = JSON.parse(line)
          if (event.type === 'step') {
            const word = TOOL_WORD[event.tool] ?? event.tool
            setPhase((p) => (p.kind === 'working' ? {kind: 'working', steps: [...p.steps, word]} : p))
          } else if (event.type === 'checking') {
            setPhase((p) => (p.kind === 'working' ? {kind: 'working', steps: [...p.steps, 'Checking every quote against its record']} : p))
          } else if (event.type === 'verdict') {
            setPhase({kind: 'done', verdict: event.verdict})
          } else if (event.type === 'error') {
            setPhase({kind: 'error', message: event.message})
          }
        }
      }
    } catch (error) {
      setPhase({kind: 'error', message: String(error)})
    }
  }

  const checks = phase.kind === 'done' ? phase.verdict.checks : null

  return (
    <main className="finder">
      <header className="brand">
        <h1>Will It Focus</h1>
        <p>Whether a camera body, lens and adapter autofocus together, from the manufacturers&apos; own documents.</p>
      </header>

      <section className="screen" aria-live="polite">
        <form
          className="ask"
          onSubmit={(e) => {
            e.preventDefault()
            ask(question)
          }}
        >
          <label htmlFor="q">Body, lens, adapter, and how you shoot</label>
          <div className="ask-row">
            <textarea
              id="q"
              rows={2}
              value={question}
              maxLength={500}
              placeholder="Canon T5i with the 18-55 STM, video"
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  ask(question)
                }
              }}
            />
            <button type="submit" disabled={phase.kind === 'working'}>
              {phase.kind === 'working' ? 'Focusing' : 'Check'}
            </button>
          </div>
          <div className="examples">
            {EXAMPLES.map((ex) => (
              <button key={ex} type="button" className="example" disabled={phase.kind === 'working'} onClick={() => ask(ex)}>
                {ex}
              </button>
            ))}
          </div>
        </form>

        {phase.kind === 'idle' && (
          <figure className="prism">
            <div>
              <Specimen />
              <figcaption className="source">
                Canon, EOS Rebel T5i manual, page 100. A quote lines up like this only when it matches its record word for word.
              </figcaption>
            </div>
          </figure>
        )}

        {phase.kind === 'working' && (
          <div className="working">
            {phase.steps.slice(0, -1).map((s, i) => (
              <div key={i}>{s}</div>
            ))}
            <div className="now">{phase.steps.at(-1)}</div>
          </div>
        )}

        {phase.kind === 'error' && <p className="error">{phase.message}</p>}
        {phase.kind === 'done' && <VerdictView verdict={phase.verdict} />}
      </section>

      <footer className="lcd">
        <span className="reading">
          {checks
            ? <>This answer: <em>{checks.verified}</em> of {checks.quotes} quotes found word for word in a manufacturer record</>
            : measured
              ? <>Across 20 questions: <em>{measured.both[0]}</em> of {measured.both[1]} quotes verbatim with the dataset, against {measured.kb[0]} of {measured.kb[1]} from the knowledge base alone</>
              : 'Every quote is checked against the manufacturer record it cites'}
        </span>
        <span>
          Sanity Context · public dataset{' '}
          <a href="https://will-it-focus.sanity.studio/" target="_blank" rel="noreferrer">
            qnl9jh8n
          </a>{' '}
          ·{' '}
          <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </span>
      </footer>
    </main>
  )
}

function VerdictView({verdict}: {verdict: CheckedVerdict}) {
  let order = 0
  return (
    <article className="verdict">
      <h2 className="headline">{verdict.headline}</h2>

      {!verdict.covered && (
        <div className="refusal" role="note">
          <strong>No manufacturer source covers this</strong>
          <span>{verdict.notCoveredReason ?? 'Nothing in the dataset or the knowledge base speaks to this combination, so there is no verdict to give.'}</span>
          <span>Will It Focus does not guess from an adapter fitting. A verdict needs a manufacturer to have said so.</span>
        </div>
      )}

      {verdict.modes.map((m) => (
        <section key={m.mode} className="mode" aria-label={MODE_NAME[m.mode]}>
          <div className="mode-head">
            <span className="mode-name">{MODE_NAME[m.mode]}</span>
            <Af label="Single-shot AF" state={m.singleAf} />
            <Af label="Continuous AF" state={m.continuousAf} />
          </div>
          <ul className="findings">
            {m.findings.map((f, i) => (
              <Finding key={i} finding={f} delay={order++ * 60} />
            ))}
            {m.remedy && (
              <li className="remedy">
                <b>Do this</b>
                {m.remedy}
              </li>
            )}
          </ul>
        </section>
      ))}
    </article>
  )
}

// A real record quote, shown resolving on the first screen so the one behaviour is visible before asking.
function Specimen() {
  const [state, setState] = useState<'pending' | 'verified'>('pending')
  useEffect(() => {
    const t = setTimeout(() => setState('verified'), 700)
    return () => clearTimeout(t)
  }, [])
  const text = 'In Basic Zone modes, the camera will normally focus the closest subject automatically.'
  return (
    <blockquote className="quote" data-state={state}>
      <span className="sr-only">{text}</span>
      <span className="split" aria-hidden>
        <span>&ldquo;{text}&rdquo;</span>
        <span>&ldquo;{text}&rdquo;</span>
      </span>
    </blockquote>
  )
}

function Af({label, state}: {label: string; state: keyof typeof STATE_WORD}) {
  return (
    <div className="af">
      <span className="af-point" data-state={state} aria-hidden />
      <span>
        {label}: <b>{STATE_WORD[state]}</b>
      </span>
    </div>
  )
}

function Finding({finding: f, delay}: {finding: CheckedFinding; delay: number}) {
  const [state, setState] = useState<'pending' | 'verified' | 'unverified'>('pending')
  const ref = useRef<HTMLQuoteElement>(null)
  useEffect(() => {
    const t = requestAnimationFrame(() => setState(f.verified ? 'verified' : 'unverified'))
    return () => cancelAnimationFrame(t)
  }, [f.verified])

  const page = f.source?.page
  const href = f.source?.url ? (page ? `${f.source.url}#page=${page}` : f.source.url) : null

  return (
    <li className="finding">
      <span className={f.kbEntry && !f.quote ? 'summary' : undefined}>{f.point}</span>
      {f.quote && (
        <blockquote ref={ref} className="quote" data-state={state} style={{['--delay' as string]: `${delay}ms`}}>
          <span className="sr-only">{f.quote}</span>
          <span className="split" aria-hidden>
            <span>&ldquo;{f.quote}&rdquo;</span>
            <span>&ldquo;{f.quote}&rdquo;</span>
          </span>
        </blockquote>
      )}
      <div className="source">
        {f.quote && !f.verified && <span className="flag">Not found word for word in the cited record. Treat as unverified.</span>}
        {f.source && (
          <span>
            {f.source.publisher}
            {page ? `, page ${page}` : ''}
            {href && (
              <>
                {' · '}
                <a href={href} target="_blank" rel="noreferrer">
                  open source
                </a>
              </>
            )}
          </span>
        )}
        {f.kbEntry && !f.quote && <span>Summary from the Sanity Knowledge Base, entry {f.kbEntry}. Not the manufacturer&apos;s words.</span>}
      </div>
    </li>
  )
}
