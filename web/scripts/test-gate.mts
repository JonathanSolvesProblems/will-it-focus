// Checks the quote gate against the cases the review found. Reads the public dataset only; no model calls.
//   npx tsx scripts/test-gate.mts
import {checkVerdict, type Verdict} from '../src/agent/verdict.ts'

const finding = (recordId: string, quote: string | null) => ({point: 'test', recordId, quote, kbEntry: null})
const cases: [string, string, string | null, boolean][] = [
  ['whole record quote', 'caveat-t5i-basic-zone-closest', 'In Basic Zone modes, the camera will normally focus the closest subject automatically. Therefore, it may not always focus your target subject.', true],
  ['one whole sentence of it', 'caveat-t5i-basic-zone-closest', 'In Basic Zone modes, the camera will normally focus the closest subject automatically.', true],
  ['truncated condition', 'caveat-18-55-stm-power-off', 'Manual focus adjustments are not possible', false],
  ['empty after squash', 'caveat-18-55-stm-power-off', ' * ', false],
  ['two-letter fragment', 'compat-mc11-sigma-art-35mm-f1-4-dg-hsm', 'AF', false],
  ['lens name only, not the row', 'compat-mc11-sigma-art-35mm-f1-4-dg-hsm', '35mm F1.4 DG HSM', false],
  ['full table row', 'compat-mc11-sigma-art-35mm-f1-4-dg-hsm', '35mm F1.4 DG HSM ○ × ×', true],
  ['paraphrase', 'caveat-t5i-basic-zone-closest', 'Auto modes focus on whatever is closest.', false],
]

let failed = 0
for (const [name, id, quote, expect] of cases) {
  const v: Verdict = {headline: 't', covered: true, notCoveredReason: null,
    modes: [{mode: 'any', condition: null, singleAf: 'notStated', continuousAf: 'notStated', findings: [finding(id, quote)], remedy: null}]}
  const got = (await checkVerdict(v)).modes[0].findings[0]
  const ok = got.verified === expect
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: verified=${got.verified}${got.recordQuote ? ' (shows record quote instead)' : ''}`)
}

// An abbreviation's period is not a sentence end: the fragment after "Approx." must not verify.
const abbrev: Verdict = {headline: 't', covered: true, notCoveredReason: null,
  modes: [{mode: 'any', condition: null, singleAf: 'notStated', continuousAf: 'notStated', remedy: null,
    findings: [finding('format-canon-apsc', '22.3 x 14.9 mm')]}]}
const ab = (await checkVerdict(abbrev)).modes[0].findings[0]
if (ab.verified) failed++
console.log(`${ab.verified ? 'FAIL' : 'ok  '} fragment after an abbreviation: verified=${ab.verified}`)

// A video-only record must not back a claim about every mode.
const anyClaim: Verdict = {headline: 't', covered: true, notCoveredReason: null,
  modes: [{mode: 'any', condition: null, singleAf: 'notStated', continuousAf: 'supported', remedy: null,
    findings: [finding('compat-t5i-video-18-55-stm', null)]}]}
const ac = (await checkVerdict(anyClaim)).modes[0].backed
if (ac.continuousAf !== false) failed++
console.log(`${ac.continuousAf === false ? 'ok  ' : 'FAIL'} video record does not back an any-mode claim: continuous=${ac.continuousAf}`)

// The topic gate: real questions pass, chatter does not. No model call either way.
const {onTopic} = await import('../src/agent/guard.ts')
const topics: [string, boolean][] = [
  ['Will my 50mm 1.8 work on the a7III', true],
  ['T5i video focus hunting', true],
  ['a6400 with the 18-135', true],
  ['GH5 speedbooster 50 1.4', true],
  ['Does eye AF work on the FTZ?', true],
  ['nikon z6 with ftz adapter and an old 85mm', true],
  ['write me a poem about pizza please', false],
  ['tell me a joke about cats', false],
  ['what is the best camera', false],
]
for (const [q, pass] of topics) {
  const ok = (onTopic(q) === null) === pass
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} topic gate ${pass ? 'passes' : 'refuses'}: ${q}`)
}

// AF state backing: a mode claiming continuous AF works, citing a record that says it does not.
const claim: Verdict = {headline: 't', covered: true, notCoveredReason: null,
  modes: [{mode: 'any', condition: null, singleAf: 'supported', continuousAf: 'supported', remedy: null,
    findings: [finding('compat-mc11-sigma-art-35mm-f1-4-dg-hsm', null)]}]}
const b = (await checkVerdict(claim)).modes[0].backed
const bOk = b.singleAf === true && b.continuousAf === false
if (!bOk) failed++
console.log(`${bOk ? 'ok  ' : 'FAIL'} AF state backing: single=${b.singleAf} continuous=${b.continuousAf} (want true, false)`)
process.exit(failed ? 1 : 0)
