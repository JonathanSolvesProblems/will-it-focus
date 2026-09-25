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
    modes: [{mode: 'any', singleAf: 'notStated', continuousAf: 'notStated', findings: [finding(id, quote)], remedy: null}]}
  const got = (await checkVerdict(v)).modes[0].findings[0]
  const ok = got.verified === expect
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: verified=${got.verified}${got.recordQuote ? ' (shows record quote instead)' : ''}`)
}

// AF state backing: a mode claiming continuous AF works, citing a record that says it does not.
const claim: Verdict = {headline: 't', covered: true, notCoveredReason: null,
  modes: [{mode: 'any', singleAf: 'supported', continuousAf: 'supported', remedy: null,
    findings: [finding('compat-mc11-sigma-art-35mm-f1-4-dg-hsm', null)]}]}
const b = (await checkVerdict(claim)).modes[0].backed
const bOk = b.singleAf === true && b.continuousAf === false
if (!bOk) failed++
console.log(`${bOk ? 'ok  ' : 'FAIL'} AF state backing: single=${b.singleAf} continuous=${b.continuousAf} (want true, false)`)
process.exit(failed ? 1 : 0)
