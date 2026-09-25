import {Finder} from './Finder'
import measured from '@/data/eval-summary.json'

export default function Page() {
  return <Finder measured={measured.kb && measured.both ? {kb: measured.kb as [number, number], both: measured.both as [number, number]} : null} />
}
