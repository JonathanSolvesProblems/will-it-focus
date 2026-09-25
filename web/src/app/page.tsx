import {Finder} from './Finder'
import summary from '@/data/eval-summary.json'

// Numbers come from eval/score.py, which writes eval-summary.json from the scored runs.
export default function Page() {
  const measured =
    'kb' in summary && summary.kb && summary.both
      ? {kb: summary.kb as [number, number], both: summary.both as [number, number], questions: summary.questions}
      : null
  return <Finder measured={measured} />
}
