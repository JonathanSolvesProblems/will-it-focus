// Builds data/records.ndjson from facts collected in data/sources-raw.md.
// Every document carries its source; PDF quotes are copied from data/kb-text and are
// verified against it by scripts/check_quotes.py. Import with:
//   cd studio && npx sanity dataset import ../data/records.ndjson production --replace

import {writeFileSync} from 'node:fs'

const RETRIEVED = '2026-09-24'
const ref = (id) => ({_type: 'reference', _ref: id})
const refs = (ids) => ids.map((id) => ({_type: 'reference', _ref: id, _key: id.replace(/\W/g, '')}))
let keyN = 0
const src = (s) => ({_type: 'source', _key: `s${keyN++}`, retrievedOn: RETRIEVED, ...s})

// Source pages used more than once.
const T5I_MANUAL = 'https://gdlp01.c-wss.com/gds/5/0300010905/07/eos-rebelt5i-700d-im7-en.pdf'
const STM_SHEET = 'http://gdlp01.c-wss.com/gds/8/0300011908/02/efs18-55f35-56isstm-im2-eng.pdf'
const ISII_SHEET = 'https://gdlp01.c-wss.com/gds/7/0300004937/02/efs18-55f35-56-is-ii-im2-eng.pdf'
const SIGMA_LENS = 'https://www.sigma-global.com/en/support/download/SIGMA_MC_11_lens_en.pdf'
const SIGMA_CAMERA = 'https://www.sigma-global.com/en/support/download/sigma_mc11_camera_en_ver3.pdf'
const METABONES = 'https://www.metabones.com/products/details/mb-ef-e-bt5'
const METABONES_MODES = 'https://www.metabones.com/article/of/green-power-save-mode'
const WIKI_FLANGE = 'https://en.wikipedia.org/wiki/Flange_focal_distance'

const canonManual = (page, quote) =>
  src({url: T5I_MANUAL, publisher: 'Canon', kind: 'manual', title: 'EOS REBEL T5i / EOS 700D Instruction Manual', page, quote})
const wiki = (quote) =>
  src({url: WIKI_FLANGE, publisher: 'Wikipedia', kind: 'other', title: 'Flange focal distance (no manufacturer page found)', quote})

const docs = []
const add = (d) => docs.push(d)

// ---------- sensor formats
add({_id: 'format.canon-apsc', _type: 'sensorFormat', name: 'Canon APS-C', widthMm: 22.3, heightMm: 14.9, cropFactor: 1.6,
  sources: [canonManual(338, 'Image sensor size: Approx. 22.3 x 14.9 mm')]})
add({_id: 'format.full-frame', _type: 'sensorFormat', name: 'Full frame (35mm)', widthMm: 36, heightMm: 24, cropFactor: 1,
  sources: [canonManual(40, 'Since the image sensor size is smaller than the 35mm film format, it will look like the lens focal length is increased by approx. 1.6x.')]})
add({_id: 'format.sony-apsc', _type: 'sensorFormat', name: 'Sony APS-C', cropFactor: 1.5,
  sources: [src({url: METABONES, publisher: 'Metabones', kind: 'manufacturerSpec', quote: 'Sony APS-C has a 1.5x crop factor'})]})

// ---------- mounts
add({_id: 'mount.canon-ef', _type: 'mount', name: 'Canon EF', maker: 'Canon', system: 'dslr', flangeDistanceMm: 44, electronicContacts: true,
  acceptsLensMounts: refs(['mount.canon-ef']),
  sources: [src({url: 'https://www.canon-europe.com/pro/infobank/rf-mount/', publisher: 'Canon', kind: 'manufacturerSpec',
    quote: 'from 44mm in the EF mount to 20mm in the RF mount'})]})
add({_id: 'mount.canon-ef-s', _type: 'mount', name: 'Canon EF-S', maker: 'Canon', system: 'dslr', flangeDistanceMm: 44, electronicContacts: true,
  acceptsLensMounts: refs(['mount.canon-ef', 'mount.canon-ef-s']),
  sources: [wiki('Canon EF-S-mount | 44.00 mm'), canonManual(39, 'The camera is compatible with all Canon EF lenses and EF-S lenses.')]})
add({_id: 'mount.canon-rf', _type: 'mount', name: 'Canon RF', maker: 'Canon', system: 'mirrorless', flangeDistanceMm: 20, electronicContacts: true,
  acceptsLensMounts: refs(['mount.canon-rf']),
  sources: [src({url: 'https://snapshot.canon-asia.com/article/eng/rf-lenses-vs-ef-lenses-whats-the-difference-and-how-to-decide', publisher: 'Canon', kind: 'manufacturerSpec',
    quote: 'The RF mount has a flange back distance of 20mm'})]})
add({_id: 'mount.sony-e', _type: 'mount', name: 'Sony E', maker: 'Sony', system: 'mirrorless', flangeDistanceMm: 18, electronicContacts: true,
  acceptsLensMounts: refs(['mount.sony-e']), sources: [wiki('Sony E-mount | 18.00 mm')]})
add({_id: 'mount.nikon-f', _type: 'mount', name: 'Nikon F', maker: 'Nikon', system: 'dslr', flangeDistanceMm: 46.5,
  acceptsLensMounts: refs(['mount.nikon-f']), sources: [wiki('Nikon F-mount | 46.50 mm')]})
add({_id: 'mount.nikon-z', _type: 'mount', name: 'Nikon Z', maker: 'Nikon', system: 'mirrorless', flangeDistanceMm: 16,
  acceptsLensMounts: refs(['mount.nikon-z']),
  sources: [src({url: 'https://www.nikonusa.com/learn-and-explore/c/products-and-innovation/nikon-z-series-z-mount-system', publisher: 'Nikon', kind: 'manufacturerSpec',
    quote: 'short 16mm flange focal distance'})]})
add({_id: 'mount.mft', _type: 'mount', name: 'Micro Four Thirds', system: 'mirrorless', flangeDistanceMm: 19.25,
  acceptsLensMounts: refs(['mount.mft']), sources: [wiki('Micro Four Thirds System | 19.25 mm')]})
add({_id: 'mount.l-mount', _type: 'mount', name: 'L-Mount', maker: 'L-Mount Alliance', system: 'mirrorless', flangeDistanceMm: 20,
  acceptsLensMounts: refs(['mount.l-mount']),
  sources: [src({url: 'https://l-mount.com/en/overview-213', publisher: 'L-Mount Alliance', kind: 'manufacturerSpec',
    quote: 'The very short flange distance of 20 millimetres'})]})
add({_id: 'mount.sigma-sa', _type: 'mount', name: 'Sigma SA', maker: 'Sigma', system: 'dslr', flangeDistanceMm: 44,
  acceptsLensMounts: refs(['mount.sigma-sa']), sources: [wiki('Sigma SA-mount | 44.00 mm')]})

// ---------- bodies
add({_id: 'body.canon-t5i', _type: 'body', name: 'Canon EOS Rebel T5i', aliases: ['EOS 700D', 'EOS Kiss X7i', 'T5i', '700D'],
  maker: 'Canon', releaseYear: 2013, mount: ref('mount.canon-ef-s'), sensorFormat: ref('format.canon-apsc'),
  viewfinderAf: 'phaseDetectModule', liveViewAf: 'hybrid', liveViewAfName: 'Hybrid CMOS AF System',
  videoContinuousAf: 'yes', videoContinuousAfName: 'Movie Servo AF',
  sources: [
    canonManual(39, 'The camera is compatible with all Canon EF lenses and EF-S lenses. The camera cannot be used with EF-M lenses.'),
    canonManual(196, 'Movie Servo AF The default setting is [Enable].'),
    src({url: 'https://global.canon/en/c-museum/product/dslr814.html', publisher: 'Canon', kind: 'manufacturerSpec',
      quote: 'The Canon EOS Kiss X7i employs a 9-point, all cross-type AF system'}),
    src({url: 'https://global.canon/en/news/2013/jul02e.html', publisher: 'Canon', kind: 'manufacturerSpec', publishedOn: '2013-07-02',
      quote: 'Hybrid CMOS AF and Hybrid CMOS AF II, which combine phase-difference AF and contrast AF.'}),
  ]})
add({_id: 'body.canon-eos-r1', _type: 'body', name: 'Canon EOS R1', maker: 'Canon', mount: ref('mount.canon-rf'),
  sources: [src({url: 'https://cam.start.canon/en/C018/manual/html/UG-01_Preparations_0080.html', publisher: 'Canon', kind: 'manual',
    quote: 'All EF and EF-S lenses can be used by attaching an optional Mount Adapter EF-EOS R .'})]})

// Sony bodies Sigma lists as checked with the MC-11 (camera table, as of June 2025).
const SONY = ['α1 II', 'α1', 'α9 II', 'α9', 'α7R V', 'α7R IV', 'α7R III', 'α7R II', 'α7R', 'α7S III', 'α7S II', 'α7S',
  'α7CR', 'α7C II', 'α7C', 'α7 IV', 'α7 III', 'α7 II', 'α7', 'α6700', 'α6600', 'α6500', 'α6400', 'α6300', 'α6100',
  'α6000', 'α5100', 'α5000', 'ZV-E10', 'ZV-E1']
const sonyId = (n) => 'body.sony-' + n.replace('α', 'a').replace(/\s+/g, '').toLowerCase()
for (const n of SONY) {
  add({_id: sonyId(n), _type: 'body', name: `Sony ${n}`, aliases: [n.replace('α', 'A'), n.replace('α', 'a')], maker: 'Sony',
    mount: ref('mount.sony-e'),
    sources: [src({url: SIGMA_CAMERA, publisher: 'Sigma', kind: 'manufacturerCompatTable', page: 1, publishedOn: '2025-06-01',
      quote: 'General operation check done by SIGMA as of June 2025.'})]})
}

// ---------- lenses
add({_id: 'lens.canon-efs-18-55-is-stm', _type: 'lens', name: 'Canon EF-S 18-55mm f/3.5-5.6 IS STM',
  aliases: ['18-55 STM', 'EF-S18-55mm f/3.5-5.6 IS STM'], maker: 'Canon', releaseYear: 2013,
  mount: ref('mount.canon-ef-s'), imageCircle: ref('format.canon-apsc'), focalMinMm: 18, focalMaxMm: 55, maxApertureWide: 3.5,
  focusMotor: 'stm', focusMotorDetail: 'Stepping motor with lead screws', manualFocusRing: 'byWire',
  sources: [
    src({url: STM_SHEET, publisher: 'Canon', kind: 'manual', page: 2, quote: 'Stepping motor with lead screws achieves quiet, smooth Movie Servo AF.'}),
    src({url: STM_SHEET, publisher: 'Canon', kind: 'manual', page: 7, quote: 'Manual focus adjustments are not possible when the camera is OFF.'}),
  ]})
add({_id: 'lens.canon-efs-18-55-is-ii', _type: 'lens', name: 'Canon EF-S 18-55mm f/3.5-5.6 IS II',
  aliases: ['18-55 IS II', 'EF-S18-55mm f/3.5-5.6 IS II'], maker: 'Canon', releaseYear: 2011,
  mount: ref('mount.canon-ef-s'), imageCircle: ref('format.canon-apsc'), focalMinMm: 18, focalMaxMm: 55, maxApertureWide: 3.5,
  focusMotor: 'microMotor', focusMotorDetail: 'Canon calls it a DC motor (Camera Museum) and a Micro Motor (Canon UK spec)',
  manualFocusRing: 'unknown',
  sources: [
    src({url: 'https://global.canon/en/c-museum/product/ef419.html', publisher: 'Canon', kind: 'manufacturerSpec',
      quote: 'compared with lenses that employ a DC motor, such as the EF-S18-55mm f/3.5-5.6 IS II'}),
    src({url: ISII_SHEET, publisher: 'Canon', kind: 'manual', page: 5, quote: 'Do not adjust focus manually when the focus mode switch is set to AF.'}),
  ]})
add({_id: 'lens.canon-ef-50-f18-ii', _type: 'lens', name: 'Canon EF 50mm f/1.8 II', aliases: ['nifty fifty', 'EF50mm f/1.8 II'],
  maker: 'Canon', releaseYear: 1990, mount: ref('mount.canon-ef'), imageCircle: ref('format.full-frame'), focalMinMm: 50, focalMaxMm: 50,
  maxApertureWide: 1.8, focusMotor: 'microMotor',
  sources: [src({url: 'https://www.canon.co.uk/for_home/product_finder/cameras/ef_lenses/standard_and_medium_telephoto/ef_50mm_f1.8_ii/specification.html',
    publisher: 'Canon', kind: 'manufacturerSpec', quote: 'AF actuator Micro Motor'})]})
add({_id: 'lens.canon-ef-50-f18-stm', _type: 'lens', name: 'Canon EF 50mm f/1.8 STM', aliases: ['EF50mm f/1.8 STM'],
  maker: 'Canon', releaseYear: 2015, mount: ref('mount.canon-ef'), imageCircle: ref('format.full-frame'), focalMinMm: 50, focalMaxMm: 50,
  maxApertureWide: 1.8, focusMotor: 'stm',
  sources: [src({url: 'https://global.canon/en/c-museum/product/ef451.html', publisher: 'Canon', kind: 'manufacturerSpec',
    quote: 'Equipped with a gear-type stepping-motor (STM) drive, the new EF50mm f/1.8 STM achieves autofocusing that is quieter than that realized by its predecessor.'})]})
add({_id: 'lens.canon-ef-40-f28-stm', _type: 'lens', name: 'Canon EF 40mm f/2.8 STM', aliases: ['EF40mm f/2.8 STM', 'pancake'],
  maker: 'Canon', releaseYear: 2012, mount: ref('mount.canon-ef'), imageCircle: ref('format.full-frame'), focalMinMm: 40, focalMaxMm: 40,
  maxApertureWide: 2.8, focusMotor: 'stm',
  sources: [src({url: 'https://global.canon/en/c-museum/product/ef419.html', publisher: 'Canon', kind: 'manufacturerSpec',
    quote: 'By incorporating an STM in the AF drive, the EF40mm f/2.8 STM makes possible even smoother, more silent AF operation'})]})

// Sigma lenses from the MC-11 lens table. Sigma's table does not say whether a row is the
// SA or the Canon EF version, so mount stays empty rather than guessed.
const SIGMA_ROWS = [
  ['Art', '30mm F1.4 DC HSM', 1, 0, 0], ['Art', '18-35mm F1.8 DC HSM', 1, 0, 0], ['Art', '50-100mm F1.8 DC HSM', 1, 0, 1],
  ['Art', '12-24mm F4 DG HSM', 1, 0, 1], ['Art', '14-24mm F2.8 DG HSM', 1, 0, 1], ['Art', '24-35mm F2 DG HSM', 1, 0, 1],
  ['Art', '24-70mm F2.8 DG OS HSM', 1, 0, 1], ['Art', '24-105mm F4 DG OS HSM', 1, 0, 0], ['Art', '14mm F1.8 DG HSM', 1, 0, 1],
  ['Art', '20mm F1.4 DG HSM', 1, 0, 1], ['Art', '24mm F1.4 DG HSM', 1, 0, 1], ['Art', '28mm F1.4 DG HSM', 1, 0, 1],
  ['Art', '35mm F1.4 DG HSM', 1, 0, 0], ['Art', '40mm F1.4 DG HSM', 1, 0, 1], ['Art', '50mm F1.4 DG HSM', 1, 0, 1],
  ['Art', '70mm F2.8 DG MACRO', 1, 0, 1], ['Art', '85mm F1.4 DG HSM', 1, 0, 1], ['Art', '105mm F1.4 DG HSM', 1, 0, 1],
  ['Art', '135mm F1.8 DG HSM', 1, 0, 1], ['Contemporary', '17-70mm F2.8-4 DC MACRO OS HSM', 1, 0, 0],
  ['Contemporary', '18-200mm F3.5-6.3 DC MACRO OS HSM', 1, 0, 0], ['Contemporary', '18-300mm F3.5-6.3 DC MACRO OS HSM', 1, 0, 0],
  ['Contemporary', '100-400mm F5-6.3 DG OS HSM', 1, 0, 1], ['Contemporary', '150-600mm F5-6.3 DG OS HSM', 1, 0, 1],
  ['Sports', '60-600mm F4.5-6.3 DG OS HSM', 1, 0, 1], ['Sports', '70-200mm F2.8 DG OS HSM', 1, 0, 1],
  ['Sports', '120-300mm F2.8 DG OS HSM', 1, 0, 0], ['Sports', '150-600mm F5-6.3 DG OS HSM', 1, 0, 1], ['Sports', '500mm F4 DG OS HSM', 1, 0, 1],
]
const sigmaId = (line, name) => `lens.sigma-${line}-${name}`.toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/-+$/, '')
for (const [line, name, afs, afc, dmf] of SIGMA_ROWS) {
  const id = sigmaId(line, name)
  const focal = name.match(/^(\d+)(?:-(\d+))?mm F([\d.]+)/)
  add({_id: id, _type: 'lens', name: `Sigma ${name} | ${line}`, maker: 'Sigma', focusMotor: name.includes('HSM') ? 'hsm' : 'unknown',
    focalMinMm: Number(focal[1]), focalMaxMm: Number(focal[2] ?? focal[1]), maxApertureWide: Number(focal[3]),
    sources: [src({url: SIGMA_LENS, publisher: 'Sigma', kind: 'manufacturerCompatTable', page: 1, quote: name})]})
  add({_id: `compat.mc11.${id.slice(5)}`, _type: 'compatibilityRecord', scope: 'listedLenses', lenses: refs([id]),
    adapters: refs(['adapter.sigma-mc11-ef-e', 'adapter.sigma-mc11-sa-e']), shootingMode: 'any',
    singleAf: afs ? 'supported' : 'notSupported', continuousAf: afc ? 'supported' : 'notSupported',
    note: `Sigma MC-11 lens table row: AFS ${afs ? '○' : '×'}, AFC/AFA ${afc ? '○' : '×'}, DMF ${dmf ? '○' : '×'}.`,
    source: src({url: SIGMA_LENS, publisher: 'Sigma', kind: 'manufacturerCompatTable', page: 1, quote: name})})
}

// ---------- adapters
const sonyBodies = refs(SONY.map(sonyId))
add({_id: 'adapter.sigma-mc11-ef-e', _type: 'adapter', name: 'Sigma MC-11 (Canon EF-E)', maker: 'Sigma',
  lensMount: ref('mount.canon-ef'), bodyMount: ref('mount.sony-e'), electronic: true, optics: 'none', testedBodies: sonyBodies,
  sources: [src({url: 'https://www.sigma-global.com/en/accessories/mc-11/', publisher: 'Sigma', kind: 'manufacturerSpec',
    quote: 'allows you to use your SIGMA SA-mount and Sigma EOS mount interchangeable lenses with the Sony E-mount camera body.'})]})
add({_id: 'adapter.sigma-mc11-sa-e', _type: 'adapter', name: 'Sigma MC-11 (Sigma SA-E)', maker: 'Sigma',
  lensMount: ref('mount.sigma-sa'), bodyMount: ref('mount.sony-e'), electronic: true, optics: 'none', testedBodies: sonyBodies,
  sources: [src({url: 'https://www.sigma-global.com/en/accessories/mc-11/', publisher: 'Sigma', kind: 'manufacturerSpec',
    quote: 'allows you to use your SIGMA SA-mount and Sigma EOS mount interchangeable lenses with the Sony E-mount camera body.'})]})
add({_id: 'adapter.metabones-ef-e-t-mkv', _type: 'adapter', name: 'Metabones Canon EF to Sony E T Smart Adapter (Mark V)',
  maker: 'Metabones', lensMount: ref('mount.canon-ef'), bodyMount: ref('mount.sony-e'), electronic: true, optics: 'none',
  sources: [src({url: METABONES, publisher: 'Metabones', kind: 'manufacturerSpec', quote: 'Canon EF Lens to Sony E Mount T Smart Adapter (Mark V)'})]})
add({_id: 'adapter.canon-ef-eos-r', _type: 'adapter', name: 'Canon Mount Adapter EF-EOS R', maker: 'Canon',
  lensMount: ref('mount.canon-ef'), bodyMount: ref('mount.canon-rf'), electronic: true, optics: 'none',
  sources: [src({url: 'https://www.canon-europe.com/lenses/eos-r-adapters/', publisher: 'Canon', kind: 'manufacturerSpec',
    quote: 'The standard Mount Adapter EF-EOS R allows EF-S and EF lenses to be used on EOS R cameras seamlessly.'})]})

// ---------- compatibility records (non-table)
add({_id: 'compat.t5i-video-18-55-stm', _type: 'compatibilityRecord', scope: 'listedLenses',
  lenses: refs(['lens.canon-efs-18-55-is-stm']), bodies: refs(['body.canon-t5i']), shootingMode: 'video',
  continuousAf: 'supported', behaviour: 'smoothQuiet',
  source: src({url: STM_SHEET, publisher: 'Canon', kind: 'manual', page: 2,
    quote: 'Function compatible with the following camera (as of June 2013): EOS REBEL T5i/700D, EOS REBEL SL1/100D, EOS REBEL T4i/650D, EOS M (when using with Mount Adapter EF-EOS M)'})})
add({_id: 'compat.mc11-video', _type: 'compatibilityRecord', scope: 'listedLenses',
  lenses: refs(SIGMA_ROWS.map(([l, n]) => sigmaId(l, n))), adapters: refs(['adapter.sigma-mc11-ef-e', 'adapter.sigma-mc11-sa-e']),
  shootingMode: 'video', singleAf: 'unknown', continuousAf: 'notSupported',
  note: 'Sigma tells MC-11 users to focus manually for video.',
  source: src({url: SIGMA_LENS, publisher: 'Sigma', kind: 'manufacturerCompatTable', page: 1, quote: 'Please use MF when shooting movies.'})})
add({_id: 'compat.metabones-mkv-modern', _type: 'compatibilityRecord', scope: 'allLensesOnMount', lensMount: ref('mount.canon-ef'),
  adapters: refs(['adapter.metabones-ef-e-t-mkv']), bodyCondition: 'Sony bodies from 2015 on with phase-detect AF, adapter in Advanced mode',
  shootingMode: 'video', continuousAf: 'supported',
  source: src({url: METABONES_MODES, publisher: 'Metabones', kind: 'manufacturerCompatTable',
    quote: 'Continuous video AF with phase-detection AF on supported cameras'})})
add({_id: 'compat.metabones-mkv-legacy', _type: 'compatibilityRecord', scope: 'allLensesOnMount', lensMount: ref('mount.canon-ef'),
  adapters: refs(['adapter.metabones-ef-e-t-mkv']), bodyCondition: 'Sony bodies from 2014 or earlier, or without phase-detect AF (e.g. A7S II)',
  shootingMode: 'any', singleAf: 'supported', continuousAf: 'limited', behaviour: 'hunts',
  source: src({url: METABONES_MODES, publisher: 'Metabones', kind: 'manufacturerCompatTable',
    quote: 'AF-C may have unsatisfactory performance and/or accuracy and may suffer from excessive hunting, depending on lens - use AF-S or DMF'})})
add({_id: 'compat.metabones-mkv-50-f18-ii', _type: 'compatibilityRecord', scope: 'listedLenses', lenses: refs(['lens.canon-ef-50-f18-ii']),
  adapters: refs(['adapter.metabones-ef-e-t-mkv']), shootingMode: 'any', singleAf: 'limited',
  source: src({url: METABONES, publisher: 'Metabones', kind: 'manufacturerCompatTable',
    quote: 'AF may not be accurate, but may be usable on a camera with PDAF (GH7, OM-1. etc.)'})})
add({_id: 'compat.ef-eos-r-all', _type: 'compatibilityRecord', scope: 'allLensesOnMount', lensMount: ref('mount.canon-ef'),
  adapters: refs(['adapter.canon-ef-eos-r']), shootingMode: 'any', singleAf: 'supported', continuousAf: 'supported',
  note: 'Canon\'s wording is "full compatibility"; it covers EF-S lenses too, with an automatic crop on full-frame bodies.',
  source: src({url: 'https://www.canon-europe.com/lenses/eos-r-adapters/', publisher: 'Canon', kind: 'manufacturerSpec',
    quote: 'The EOS R System adapters offer full compatibility with Canon EF and EF-S lenses'})})

// ---------- focus caveats (T5i manual)
add({_id: 'caveat.t5i-basic-zone-closest', _type: 'focusCaveat', title: 'Auto modes focus the closest subject',
  bodies: refs(['body.canon-t5i']), shootingMode: 'viewfinderPhoto', appliesWhen: 'Basic Zone (auto) shooting modes',
  effect: 'wrongSubject', remedy: 'In P, Tv, Av or M you can select the AF point yourself and use it to focus the target subject.',
  source: canonManual(100, 'In Basic Zone modes, the camera will normally focus the closest subject automatically. Therefore, it may not always focus your target subject.')})
add({_id: 'caveat.t5i-liveview-slow-lenses', _type: 'focusCaveat', title: 'Some older lenses focus slowly in live view contrast AF',
  bodies: refs(['body.canon-t5i']), lenses: refs(['lens.canon-ef-50-f18-ii']), shootingMode: 'liveViewPhoto',
  appliesWhen: 'Live view with Face+Tracking, FlexiZone-Multi or FlexiZone-Single', effect: 'slowOrFails',
  remedy: 'Use Quick mode for these lenses (not available for movies).',
  source: canonManual(165, 'If you use AF with any of the following lenses, using [Quick mode] is recommended. If you use the [u+Tracking], [FlexiZone - Multi] or [FlexiZone - Single] for AF, it may take a longer time to achieve focus or the camera may not be able to achieve correct focus.')})
add({_id: 'caveat.t5i-movie-lens-noise', _type: 'focusCaveat', title: 'Lens focusing noise can be recorded during Movie Servo AF',
  bodies: refs(['body.canon-t5i']), shootingMode: 'video', appliesWhen: 'Movie Servo AF enabled', effect: 'audibleNoise',
  remedy: 'Use an STM lens such as the EF-S 18-55mm IS STM, or an external microphone.',
  source: canonManual(196, 'With certain lenses, the lens mechanical sound during focusing may be recorded.')})
add({_id: 'caveat.t5i-viewfinder-difficult', _type: 'focusCaveat', title: 'Subjects the viewfinder AF can fail on',
  bodies: refs(['body.canon-t5i']), shootingMode: 'viewfinderPhoto', appliesWhen: 'Very low contrast, very low light, backlit, repetitive patterns',
  effect: 'slowOrFails', remedy: 'Lock focus on an object at the same distance and recompose, or switch the lens to MF.',
  source: canonManual(103, 'Autofocus can fail to achieve focus (viewfinder’s focus confirmation light <o> blinks) with certain subjects such as the following:')})
add({_id: 'caveat.t5i-liveview-difficult', _type: 'focusCaveat', title: 'Conditions that make live view and video AF difficult',
  bodies: refs(['body.canon-t5i']), shootingMode: 'liveViewPhoto', appliesWhen: 'Low contrast, low light, repetitive patterns, moving subjects',
  effect: 'hunts', remedy: 'If focus is not achieved, set the lens focus mode switch to MF and focus manually.',
  source: canonManual(165, 'Shooting conditions that make focusing difficult')})
add({_id: 'caveat.18-55-stm-power-off', _type: 'focusCaveat', title: 'The STM lens cannot be focused by hand while the camera is off',
  lenses: refs(['lens.canon-efs-18-55-is-stm']), shootingMode: 'any', appliesWhen: 'Camera off, or lens in sleep mode', effect: 'other',
  remedy: 'Press the shutter button halfway to wake the lens.',
  // The sheet repeats a bare "Manual focus adjustments are not possible." under both headings;
  // this is the one sentence that carries its condition, so it cannot be read as absolute.
  source: src({url: STM_SHEET, publisher: 'Canon', kind: 'manual', page: 7, quote: 'Manual focus adjustments are not possible when the camera is OFF.'})})

// Sanity treats an id containing "." as a private path, hidden from public reads,
// so ids are written with dashes. The dotted form above is only for readability here.
const publicIds = (key, value) => ((key === '_id' || key === '_ref') ? value.replace(/\./g, '-') : value)
writeFileSync(
  new URL('./records.ndjson', import.meta.url),
  docs.map((d) => JSON.stringify(d, publicIds)).join('\n') + '\n',
)
const byType = docs.reduce((a, d) => ((a[d._type] = (a[d._type] ?? 0) + 1), a), {})
console.log(`${docs.length} documents`, byType)
