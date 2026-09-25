'use client'

import {useEffect, useRef, useState} from 'react'
import type {CheckedFinding, CheckedVerdict} from '@/agent/verdict'
import {EXAMPLE_QUESTIONS as EXAMPLES} from '@/data/exampleQuestions'

// The order a photographer meets them: through the viewfinder, on the screen, then recording.
const MODE_ORDER = ['viewfinderPhoto', 'liveViewPhoto', 'video', 'any']
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

type Answered = CheckedVerdict & {model?: string}
type Phase =
  | {kind: 'idle'}
  | {kind: 'working'; steps: string[]}
  | {kind: 'done'; verdict: Answered; saved: boolean}
  | {kind: 'error'; message: string}

export function Finder({measured}: {measured: {kb: [number, number]; both: [number, number]; questions: number} | null}) {
  const [question, setQuestion] = useState('')
  const [phase, setPhase] = useState<Phase>({kind: 'idle'})
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const busy = useRef(false)
  const box = useRef<HTMLTextAreaElement>(null)

  // The box grows with the question, so a long one is never clipped at phone width.
  useEffect(() => {
    const el = box.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [question])

  async function ask(q: string) {
    // One run at a time: a second submit (Enter included) would start another paid run.
    if (q.trim().length < 4 || busy.current) return
    busy.current = true
    setQuestion(q)
    setPhase({kind: 'working', steps: ['Starting']})
    let answered = false
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
            answered = true
            setPhase({kind: 'done', verdict: event.verdict, saved: !!event.saved})
          } else if (event.type === 'error') {
            answered = true
            setPhase({kind: 'error', message: event.message})
          }
        }
      }
      if (!answered) setPhase({kind: 'error', message: 'The answer was cut off before it finished. Try again, or try an example question.'})
    } catch {
      setPhase({kind: 'error', message: 'Could not reach the server. Check your connection and try again.'})
    } finally {
      busy.current = false
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
              ref={box}
              rows={2}
              value={question}
              maxLength={300}
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
        {phase.kind === 'done' && <VerdictView verdict={phase.verdict} saved={phase.saved} />}
      </section>

      <footer className="lcd">
        <span className="reading">
          {checks && checks.quotes === 0
            ? phase.kind === 'done' && phase.verdict.covered
              ? <>This answer quotes nothing: every point in it is a labelled knowledge base summary</>
              : <>This answer quotes nothing, because no manufacturer record covers the question</>
            : checks
            ? <>This answer: <em>{checks.verified}</em> of {checks.quotes} quotes found word for word in a manufacturer record</>
            : measured
              ? <>Across {measured.questions} test questions: <em>{measured.both[0]}</em> of {measured.both[1]} quotes were the manufacturer&apos;s words with typed records, against {measured.kb[0]} of {measured.kb[1]} from the knowledge base alone</>
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

function VerdictView({verdict, saved}: {verdict: Answered; saved: boolean}) {
  let order = 0
  return (
    <article className="verdict">
      <h2 className="headline" data-long={verdict.headline.length > 110 || undefined}>
        {verdict.headline}
      </h2>
      {saved && (
        <p className="provenance">
          Saved answer to an example question, produced by the same agent{verdict.model ? ` on ${verdict.model}` : ''} and checked
          the same way. Type your own question for a live run.
        </p>
      )}

      {!verdict.covered && (
        <div className="refusal" role="note">
          <strong>No manufacturer source covers this</strong>
          <span>{verdict.notCoveredReason ?? 'Nothing in the dataset or the knowledge base speaks to this combination, so there is no verdict to give.'}</span>
          <span>Will It Focus does not guess from an adapter fitting. A verdict needs a manufacturer to have said so.</span>
        </div>
      )}

      {[...verdict.modes].sort((a, b) => MODE_ORDER.indexOf(a.mode) - MODE_ORDER.indexOf(b.mode)).map((m) => (
        <section key={m.mode} className="mode" aria-label={MODE_NAME[m.mode]}>
          <div className="mode-head">
            <span className="mode-name">{MODE_NAME[m.mode]}</span>
            <Af label="Single-shot AF" state={m.singleAf} backed={m.backed.singleAf} />
            <Af label="Continuous AF" state={m.continuousAf} backed={m.backed.continuousAf} />
          </div>
          <ul className="findings">
            {m.findings.map((f, i) => (
              <Finding key={i} finding={f} delay={order++ * 60} />
            ))}
            {m.remedy && (
              <li className="remedy">
                <b>Suggestion</b>
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
  return <Resolved text="In Basic Zone modes, the camera will normally focus the closest subject automatically." delay={700} />
}

// Text taken straight from a record: it enters sheared and lines up.
function Resolved({text, delay}: {text: string; delay: number}) {
  const [state, setState] = useState<'pending' | 'verified'>('pending')
  useEffect(() => {
    const t = setTimeout(() => setState('verified'), delay)
    return () => clearTimeout(t)
  }, [delay])
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

function Af({label, state, backed}: {label: string; state: keyof typeof STATE_WORD; backed: boolean | null}) {
  return (
    <div className="af">
      <span className="af-point" data-state={state} aria-hidden />
      <span>
        {label}: <b>{STATE_WORD[state]}</b>
        {backed === false && <span className="unbacked"> · no cited record says this</span>}
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
      {f.recordQuote && (
        <>
          <span className="flag">
            The agent reworded this. It is not in the record word for word, so here is what the record actually says:
          </span>
          <Resolved text={f.recordQuote} delay={delay + 300} />
        </>
      )}
      <div className="source">
        {f.quote && !f.verified && !f.recordQuote && (
          <span className="flag">Not found word for word in the cited record. Treat as unverified.</span>
        )}
        {f.source && (
          <span>
            {f.source.publisher}
            {page ? `, page ${page}` : ''}
            {href && (
              <>
                {' · '}
                <a href={href} target="_blank" rel="noreferrer">
                  {page ? `view page ${page}` : 'view the page'}
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
