# Camera AF compatibility facts: raw sourced extractions

Collected 2026-09-24. Every quote was copied from text extracted directly out of the page or PDF (curl + HTML/PDF text extraction, not an AI summary). Line wraps in PDFs have been joined with a single space; nothing else was changed. `[...]` marks an omission inside a quote.

Access notes:
- canon-europe.com, canon.co.uk, canon.ie, canon-me.com, usa.canon.com and cla.canon.com all returned HTTP 403 to automated fetches. Where a Canon regional page was needed, the Internet Archive capture of that same Canon page was used. The `url` field keeps the original Canon URL; the `archivedAt` field gives the capture actually read.
- The two sigma-global.com `?tab=support&local=table&table_id=...` URLs render their tables with JavaScript and return no table data to a plain fetch. The same data was taken from the PDFs Sigma links on its own support page (https://www.sigma-global.com/en/support/accessories-compatibility/).
- Wikipedia is used only where no manufacturer page with the number could be found. Those entries are marked `kind: "other"` and flagged `WIKIPEDIA_FALLBACK`.

---

## 1. Canon EOS Rebel T5i / EOS 700D / EOS Kiss X7i

```json
[
  {"field": "regionalNames", "value": "EOS Kiss X7i (Japan); EOS Rebel T5i (Americas); EOS 700D (Europe, Asia, Oceania)",
   "url": "https://global.canon/en/c-museum/product/dslr814.html", "publisher": "Canon Inc. (Canon Camera Museum)", "kind": "manufacturerSpec",
   "quote": "EOS Kiss X7i\nEOS Rebel T5i\nEOS 700D\nJapan\nAmericas\nEurope, Asia, Oceania",
   "note": "Header table on the page: names in one row, regions in the row beneath, same column order."},

  {"field": "announced", "value": "2013-03-21 (Canon Canada announcement)",
   "url": "https://www.canon.ca/dam/about/News/Press-Releases/2013/2013-MAR-21-EOSREBELT5I-EN.pdf", "publisher": "Canon Canada Inc.", "kind": "manufacturerSpec",
   "quote": "MISSISSAUGA, ON, 21 March 2013", "publishedOn": "2013-03-21"},

  {"field": "releaseYear", "value": "2013 (marketed April 2013)",
   "url": "https://global.canon/en/c-museum/product/dslr814.html", "publisher": "Canon Inc. (Canon Camera Museum)", "kind": "manufacturerSpec",
   "quote": "Marketed\nApril 2013"},

  {"field": "releaseYear (availability, Canada)", "value": "April 2013",
   "url": "https://www.canon.ca/dam/about/News/Press-Releases/2013/2013-MAR-21-EOSREBELT5I-EN.pdf", "publisher": "Canon Canada Inc.", "kind": "manufacturerSpec",
   "quote": "The EOS Rebel T5i Digital SLR camera will be available in April for an estimated retail price of $779.99 for the body alone; $929.99 bundled with an EF-S 18-55mm f/3.5-5.6 IS STM lens kit, and $1,129.99 with the EF-S 18-135mm f/3.5-5.6 IS STM lens kit.",
   "publishedOn": "2013-03-21"},

  {"field": "mount", "value": "Canon EF mount; accepts EF and EF-S lenses (not EF-M)",
   "url": "https://global.canon/en/c-museum/product/dslr814.html", "publisher": "Canon Inc. (Canon Camera Museum)", "kind": "manufacturerSpec",
   "quote": "Compatible lenses\nCanon EF lenses (including EF-S lenses)\n* Excluding EF-M lenses\n(35 mm-equivalent focal length is approx. 1.6 times the lens focal length)\nLens Mount\nCanon EF mount"},

  {"field": "mount (manual)", "value": "Compatible with all EF and EF-S lenses; not EF-M",
   "url": "https://gdlp01.c-wss.com/gds/5/0300010905/07/eos-rebelt5i-700d-im7-en.pdf", "publisher": "Canon Inc. (EOS REBEL T5i/EOS 700D Instruction Manual, p.38)", "kind": "manual",
   "quote": "The camera is compatible with all Canon EF lenses and EF-S lenses. The camera cannot be used with EF-M lenses."},

  {"field": "mount (Canon UK spec)", "value": "EF/EF-S",
   "url": "https://www.canon.co.uk/for_home/product_finder/cameras/digital_slr/eos_700d/specification.html",
   "archivedAt": "https://web.archive.org/web/20190823102824/https://www.canon.co.uk/for_home/product_finder/cameras/digital_slr/eos_700d/specification.html",
   "publisher": "Canon UK", "kind": "manufacturerSpec",
   "quote": "Lens Mount\nEF/EF-S\nFocal Length\nEquivalent to 1.6x the focal length of the lens"},

  {"field": "sensorSizeMm", "value": "22.3 x 14.9 mm",
   "url": "https://gdlp01.c-wss.com/gds/5/0300010905/07/eos-rebelt5i-700d-im7-en.pdf", "publisher": "Canon Inc. (Instruction Manual, Specifications p.338)", "kind": "manual",
   "quote": "Image sensor size:\nApprox. 22.3 x 14.9 mm"},

  {"field": "cropFactor", "value": "1.6",
   "url": "https://gdlp01.c-wss.com/gds/5/0300010905/07/eos-rebelt5i-700d-im7-en.pdf", "publisher": "Canon Inc. (Instruction Manual, p.39)", "kind": "manual",
   "quote": "Since the image sensor size is smaller than the 35mm film format, it will look like the lens focal length is increased by approx. 1.6x.",
   "note": "Printed beside 'Image sensor size (Approx.) (22.3 x 14.9 mm / 0.88 x 0.59 in.)' and '35mm image size (36 x 24 mm / 1.42 x 0.94 in.)'."},

  {"field": "viewfinderAF", "value": "9 points, all cross-type; center point f/2.8 high-precision",
   "url": "https://global.canon/en/c-museum/product/dslr814.html", "publisher": "Canon Inc. (Canon Camera Museum)", "kind": "manufacturerSpec",
   "quote": "The Canon EOS Kiss X7i employs a 9-point, all cross-type AF system that, during viewfinder shooting, makes possible excellent focusing results regardless of the image composition or subject pattern."},

  {"field": "viewfinderAF (spec row)", "value": "TTL secondary image-registration phase detection; nine cross-type points",
   "url": "https://global.canon/en/c-museum/product/dslr814.html", "publisher": "Canon Inc. (Canon Camera Museum)", "kind": "manufacturerSpec",
   "quote": "Type\nTTL secondary image-registration, phase detection\nAF points\nNine cross-type AF points (Cross-type AF sensitive to f/2.8 with center AF point)"},

  {"field": "viewfinderAF (caveat)", "value": "All points cross-type with lenses up to f/5.6; some old EF 35-80/35-105 zooms get cross-type at center only",
   "url": "https://gdlp01.c-wss.com/gds/5/0300010905/07/eos-rebelt5i-700d-im7-en.pdf", "publisher": "Canon Inc. (Instruction Manual, p.101)", "kind": "manual",
   "quote": "With maximum apertures up to f/5.6: Cross-type focusing (vertical and horizontal lines detected simultaneously) is possible with all AF points. With certain lenses (see below), the off-center AF points will detect only vertical or horizontal lines (no cross-type focusing)."},

  {"field": "viewfinderAF (Canada release)", "value": "nine all cross-type points",
   "url": "https://www.canon.ca/dam/about/News/Press-Releases/2013/2013-MAR-21-EOSREBELT5I-EN.pdf", "publisher": "Canon Canada Inc.", "kind": "manufacturerSpec",
   "quote": "With a continuous shooting speed of up to 5.0 frames per second (fps) united with nine all cross-type AF focus points, the new EOS Rebel T5i allows photographers the opportunity to shoot with ease, even in challenging shooting situations.",
   "publishedOn": "2013-03-21"},

  {"field": "liveViewVideoAFSystemName", "value": "Hybrid CMOS AF System (Face+Tracking, FlexiZone-Multi, FlexiZone-Single); plus Quick mode = phase-difference via the dedicated AF sensor",
   "url": "https://gdlp01.c-wss.com/gds/5/0300010905/07/eos-rebelt5i-700d-im7-en.pdf", "publisher": "Canon Inc. (Instruction Manual, Specifications p.340-341)", "kind": "manual",
   "quote": "Focusing:\nHybrid CMOS AF System* (Face+Tracking, FlexiZone-Multi, FlexiZone-Single), Phase-difference detection (Quick mode)",
   "note": "Live View row. The Movie Shooting row reads 'Hybrid CMOS AF System* (Face+Tracking, FlexiZone-Multi, FlexiZone-Single)' with no Quick mode."},

  {"field": "liveViewAF (Canada release)", "value": "Hybrid CMOS AF in Live View for photos and video",
   "url": "https://www.canon.ca/dam/about/News/Press-Releases/2013/2013-MAR-21-EOSREBELT5I-EN.pdf", "publisher": "Canon Canada Inc.", "kind": "manufacturerSpec",
   "quote": "When shooting in Live View mode, the Hybrid CMOS AF system enables speedy and accurate autofocus for photos and video.",
   "publishedOn": "2013-03-21"},

  {"field": "hybridCmosAF = on-sensor phase + contrast", "value": "Yes. Canon describes Hybrid CMOS AF (and Hybrid CMOS AF II) as combining phase-difference AF and contrast AF, the phase-difference part being on the image sensor.",
   "url": "https://global.canon/en/news/2013/jul02e.html", "publisher": "Canon Inc. (Dual Pixel CMOS AF development announcement, footnote 3)", "kind": "manufacturerSpec",
   "quote": "Hybrid CMOS AF and Hybrid CMOS AF II, which combine phase-difference AF and contrast AF.",
   "publishedOn": "2013-07-02",
   "note": "Footnote 3 attached to the phrase \"Canon's previous image-plane phase-difference AF\". This is a general Canon statement about Hybrid CMOS AF, not a T5i-specific page."},

  {"field": "hybridCmosAF = on-sensor phase + contrast (first-generation description, EOS Kiss X6i / Rebel T4i / 650D)", "value": "contrast-detection plus phase-detection made possible through the CMOS sensor",
   "url": "https://global.canon/en/c-museum/product/dslr811.html", "publisher": "Canon Inc. (Canon Camera Museum, EOS Rebel T4i page)", "kind": "manufacturerSpec",
   "quote": "During Live View shooting and movie recording, the camera delivers faster focusing performance compared with the previous model thanks to the newly developed Hybrid CMOS AF which, in addition to contrast-detection AF, includes phase-detection AF made possible through the CMOS sensor.",
   "note": "Describes the T5i's predecessor, where the T5i's Live View AF system name (Hybrid CMOS AF) was introduced. No T5i-specific Canon page found that spells out phase + contrast."},

  {"field": "liveViewAF uses image sensor", "value": "All Live View AF methods except Quick mode use the image sensor",
   "url": "https://gdlp01.c-wss.com/gds/5/0300010905/07/eos-rebelt5i-700d-im7-en.pdf", "publisher": "Canon Inc. (Instruction Manual, p.159)", "kind": "manual",
   "quote": "AF methods other than the [Quick mode] use the image sensor to autofocus while displaying the Live View image."},

  {"field": "movieServoAF", "value": "Supported; default Enable",
   "url": "https://gdlp01.c-wss.com/gds/5/0300010905/07/eos-rebelt5i-700d-im7-en.pdf", "publisher": "Canon Inc. (Instruction Manual, p.196)", "kind": "manual",
   "quote": "Movie Servo AF The default setting is [Enable]. You can focus by pressing the shutter button halfway regardless of the setting."},

  {"field": "movieServoAF (spec row)", "value": "Servo AF during movie: Provided",
   "url": "https://gdlp01.c-wss.com/gds/5/0300010905/07/eos-rebelt5i-700d-im7-en.pdf", "publisher": "Canon Inc. (Instruction Manual, Specifications p.341)", "kind": "manual",
   "quote": "Servo AF:\nProvided"},

  {"field": "movieServoAF (museum)", "value": "Movie Servo AF tracks moving subjects; especially quiet/smooth with EF-S 18-55 IS STM",
   "url": "https://global.canon/en/c-museum/product/dslr814.html", "publisher": "Canon Inc. (Canon Camera Museum)", "kind": "manufacturerSpec",
   "quote": "During video recording, the EOS Kiss X7i’s Movie Servo AF function tracks moving subjects for smooth focusing performance. In addition, when paired with the EF-S18-55mm f/3.5-5.6 IS STM interchangeable lens (released in April of 2013), equipped with a stepping motor, the camera achieves especially quiet, smooth AF operation."},

  {"field": "movieServoAF with non-STM lenses vs STM (closest Canon statement)", "value": "Movie Servo AF focuses continuously; with certain lenses the focus mechanism noise is recorded; the two STM kit lenses minimise it",
   "url": "https://gdlp01.c-wss.com/gds/5/0300010905/07/eos-rebelt5i-700d-im7-en.pdf", "publisher": "Canon Inc. (Instruction Manual, p.196)", "kind": "manual",
   "quote": "You can shoot a movie while focusing a moving subject continuously. With certain lenses, the lens mechanical sound during focusing may be recorded. If this happens, use the Directional Stereo Microphone DM-E1 (sold separately) to reduce the lens mechanical sound in the movie. Using EF-S18-55mm f/3.5-5.6 IS STM or EF-S18-135mm f/3.5-5.6 IS STM lens can minimize the focusing noise recorded during movie shooting."},

  {"field": "movieServoAF near-silent with STM (Canon UK)", "value": "near-silent Movie Servo AF with compatible STM lenses",
   "url": "http://www.canon.co.uk/For_Home/Product_Finder/Cameras/Digital_SLR/EOS_700D/index.aspx",
   "archivedAt": "https://web.archive.org/web/20150104041607/http://www.canon.co.uk/For_Home/Product_Finder/Cameras/Digital_SLR/EOS_700D/index.aspx",
   "publisher": "Canon UK", "kind": "manufacturerSpec",
   "quote": "Hybrid AF technology enables continuous focusing when shooting video, and the EOS 700D supports near-silent Movie Servo AF with compatible STM lenses."},

  {"field": "movieServoAF (Canada release)", "value": "continuous AF in movie; STM lens means only scene sound is captured",
   "url": "https://www.canon.ca/dam/about/News/Press-Releases/2013/2013-MAR-21-EOSREBELT5I-EN.pdf", "publisher": "Canon Canada Inc.", "kind": "manufacturerSpec",
   "quote": "With Canon's Hybrid CMOS AF System and Movie Servo AF, the camera provides continuous AF for focus tracking of moving subjects by helping to reduce the camera's need to \"hunt\", resulting in a quick and smooth continuous AF. While shooting with one of Canon's Stepping Motor (STM) lenses, such as the new EF-S 18-55mm f/3.5-5.6 IS STM lens, the camera will only capture the stereo sound of the scene being recorded.",
   "publishedOn": "2013-03-21"},

  {"field": "explicit statement 'Movie Servo AF works with all EF lenses'", "value": "NOT FOUND",
   "url": null, "publisher": null, "kind": null, "quote": null,
   "note": "No Canon page or manual found that says Movie Servo AF works with ALL EF lenses. The manual only says 'With certain lenses, the lens mechanical sound during focusing may be recorded' (quoted above), which implies non-STM lenses still run Movie Servo AF but does not state it for all lenses. Do not encode 'all EF lenses' as a sourced fact."}
]
```

---

## 2. Canon EF-S 18-55mm f/3.5-5.6 IS II

```json
[
  {"field": "focusMotor", "value": "DC motor (Canon Camera Museum wording)",
   "url": "https://global.canon/en/c-museum/product/ef419.html", "publisher": "Canon Inc. (Canon Camera Museum, EF40mm f/2.8 STM page)", "kind": "manufacturerSpec",
   "quote": "By incorporating an STM in the AF drive, the EF40mm f/2.8 STM makes possible even smoother, more silent AF operation compared with lenses that employ a DC motor, such as the EF-S18-55mm f/3.5-5.6 IS II (released in March of 2011)."},

  {"field": "focusMotor (Canon UK spec row)", "value": "Micro Motor",
   "url": "http://www.canon.co.uk/For_Home/Product_Finder/Cameras/EF_Lenses/EF-S/EF-S_18-55mm_f3.5-5.6_IS_II/index.aspx?specs=1",
   "archivedAt": "https://web.archive.org/web/20130622105104/http://www.canon.co.uk/For_Home/Product_Finder/Cameras/EF_Lenses/EF-S/EF-S_18-55mm_f3.5-5.6_IS_II/index.aspx?specs=1",
   "publisher": "Canon UK", "kind": "manufacturerSpec",
   "quote": "AF actuator\nMicro Motor",
   "note": "Canon's two pages use different terms (DC motor / Micro Motor). Both describe a non-USM, non-STM geared DC micro-motor; store both labels rather than choosing one."},

  {"field": "frontElementRotates", "value": "Yes",
   "url": "https://gdlp01.c-wss.com/gds/7/0300004937/02/efs18-55f35-56-is-ii-im2-eng.pdf", "publisher": "Canon Inc. (EF-S18-55mm f/3.5-5.6 IS II Instruction, Filters section)", "kind": "manual",
   "quote": "The front end of the lens rotates, so hold it when attaching the filter."},

  {"field": "rotatingPartsDuringAF", "value": "Rotating parts during AF",
   "url": "https://gdlp01.c-wss.com/gds/7/0300004937/02/efs18-55f35-56-is-ii-im2-eng.pdf", "publisher": "Canon Inc. (EF-S18-55mm f/3.5-5.6 IS II Instruction, Setting the Focus Mode)", "kind": "manual",
   "quote": "Do not touch the rotating parts of the lens while autofocus is active."},

  {"field": "manualFocusRingMechanical", "value": "NOT FOUND (no Canon statement that the ring is mechanical). Related: no full-time manual; MF only with switch at MF.",
   "url": "https://gdlp01.c-wss.com/gds/7/0300004937/02/efs18-55f35-56-is-ii-im2-eng.pdf", "publisher": "Canon Inc. (EF-S18-55mm f/3.5-5.6 IS II Instruction)", "kind": "manual",
   "quote": "To use only manual focusing, set the focus mode switch to MF, and focus by turning the focusing ring. [...] Do not adjust focus manually when the focus mode switch is set to AF.",
   "note": "Quote supports 'no full-time manual override'. It does NOT state the ring is mechanically coupled; that part is NOT FOUND."},

  {"field": "releaseYear", "value": "2011 (marketed March 2011)",
   "url": "https://global.canon/en/c-museum/product/ef411.html", "publisher": "Canon Inc. (Canon Camera Museum)", "kind": "manufacturerSpec",
   "quote": "Marketed\nMarch 2011"},

  {"field": "bundledWithT5iInAnyRegion", "value": "NOT FOUND",
   "url": null, "publisher": null, "kind": null, "quote": null,
   "note": "Canon Canada's T5i launch release lists only STM kits (18-55 IS STM, 18-135 IS STM). Canon Camera Museum pairs the T5i with the 18-55 IS STM. No manufacturer or review page found that shows a T5i/700D/X7i kit with the IS II."}
]
```

---

## 3. Canon EF-S 18-55mm f/3.5-5.6 IS STM

```json
[
  {"field": "focusMotor", "value": "STM (stepping motor with lead screw)",
   "url": "http://gdlp01.c-wss.com/gds/8/0300011908/02/efs18-55f35-56isstm-im2-eng.pdf", "publisher": "Canon Inc. (EF-S18-55mm f/3.5-5.6 IS STM Instructions)", "kind": "manual",
   "quote": "\"STM\" stands for stepping motor. Features 1. Improved Movie Shooting Functions • Stepping motor with lead screws achieves quiet, smooth Movie Servo AF. *1",
   "note": "Footnote *1: 'Function compatible with the following camera (as of June 2013): EOS REBEL T5i/700D, EOS REBEL SL1/100D, EOS REBEL T4i/650D, EOS M (when using with Mount Adapter EF-EOS M)'."},

  {"field": "focusMotor (drives focus + controls during zoom)", "value": "Stepping motor drives the focus lens",
   "url": "http://gdlp01.c-wss.com/gds/8/0300011908/02/efs18-55f35-56isstm-im2-eng.pdf", "publisher": "Canon Inc. (Instructions, Shooting Precautions)", "kind": "manual",
   "quote": "The EF-S18-55mm f/3.5-5.6 IS STM utilizes a stepping motor that drives the focus lens. The motor also controls the focus lens during zooming."},

  {"field": "manualFocus = focus-by-wire", "value": "Electronic MF; ring rotation detected electronically; no MF with camera off",
   "url": "http://gdlp01.c-wss.com/gds/8/0300011908/02/efs18-55f35-56isstm-im2-eng.pdf", "publisher": "Canon Inc. (Instructions, Features item 5)", "kind": "manual",
   "quote": "Electronic manual focusing (MF) made possible by electronically detecting the rotation of the focusing ring."},

  {"field": "manualFocus (camera off)", "value": "MF not possible when camera is off or lens asleep",
   "url": "http://gdlp01.c-wss.com/gds/8/0300011908/02/efs18-55f35-56isstm-im2-eng.pdf", "publisher": "Canon Inc. (Instructions, Setting the Focus Mode)", "kind": "manual",
   "quote": "Manual focus adjustments are not possible when the camera is OFF."},

  {"field": "fullTimeManual", "value": "Yes, after One Shot AF",
   "url": "http://gdlp01.c-wss.com/gds/8/0300011908/02/efs18-55f35-56isstm-im2-eng.pdf", "publisher": "Canon Inc. (Instructions, Setting the Focus Mode)", "kind": "manual",
   "quote": "After autofocusing in ONE SHOT AF mode, focus manually by pressing the shutter button halfway and turning the focusing ring. (Full-time manual focus)"},

  {"field": "releaseYear", "value": "2013 (marketed April 2013)",
   "url": "https://global.canon/en/c-museum/product/ef427.html", "publisher": "Canon Inc. (Canon Camera Museum)", "kind": "manufacturerSpec",
   "quote": "Marketed\nApril 2013"},

  {"field": "announcedWith700D", "value": "Yes, announced 2013-03-21 alongside the T5i; standard kit lens",
   "url": "https://www.canon.ca/dam/about/News/Press-Releases/2013/2013-MAR-21-EOSREBELT5I-EN.pdf", "publisher": "Canon Canada Inc.", "kind": "manufacturerSpec",
   "quote": "Coupled with Canon's new EF-S 18-55mm f/3.5-5.6 IS STM lens, available in the standard kit lens bundle, the EOS Rebel T5i takes full advantage of the Stepping Motor (STM) technology, which allows the lens to smoothly and silently focus on the subject whether it is moving or standing still.",
   "publishedOn": "2013-03-21"},

  {"field": "videoAF", "value": "Significantly improved video AF; quiet, smooth with Movie Servo AF bodies (T5i/700D, SL1/100D), excluding Quick AF",
   "url": "https://global.canon/en/c-museum/product/ef427.html", "publisher": "Canon Inc. (Canon Camera Museum)", "kind": "manufacturerSpec",
   "quote": "Employing a new focus mechanism design incorporating a stepping motor (STM) and lead screw, the EF-S18-55mm f/3.5-5.6 IS STM achieves significantly improved AF operation when recording video. In particular, when paired with a Canon SLR camera equipped with Movie Servo AF, such as the EOS Rebel T5i(EOS 700D) or EOS Rebel SL1(EOS 100D) (both to be available from late April 2013), the lens realizes exceptionally quiet, smooth AF performance, even during Live View shooting (excluding Quick AF)."},

  {"field": "videoAF (Canada release)", "value": "smooth and quiet continuous AF with Hybrid CMOS AF",
   "url": "https://www.canon.ca/dam/about/News/Press-Releases/2013/2013-MAR-21-EOSREBELT5I-EN.pdf", "publisher": "Canon Canada Inc.", "kind": "manufacturerSpec",
   "quote": "When paired with the Hybrid CMOS AF, it allows for smooth and quiet, continuous AF for photo and video capturing - making it the perfect combination for preserving those once in a lifetime moments.",
   "publishedOn": "2013-03-21"}
]
```

---

## 4. Canon EF 50mm f/1.8 II, EF 50mm f/1.8 STM, EF 40mm f/2.8 STM

```json
[
  {"field": "EF 50mm f/1.8 II focusMotor", "value": "Micro Motor",
   "url": "https://www.canon.co.uk/for_home/product_finder/cameras/ef_lenses/standard_and_medium_telephoto/ef_50mm_f1.8_ii/specification.html",
   "archivedAt": "https://web.archive.org/web/20210122002256/https://www.canon.co.uk/for_home/product_finder/cameras/ef_lenses/standard_and_medium_telephoto/ef_50mm_f1.8_ii/specification.html",
   "publisher": "Canon UK", "kind": "manufacturerSpec",
   "quote": "AF actuator\nMicro Motor"},

  {"field": "EF 50mm f/1.8 II releaseYear", "value": "1990 (marketed December 1990)",
   "url": "https://global.canon/en/c-museum/product/ef295.html", "publisher": "Canon Inc. (Canon Camera Museum)", "kind": "manufacturerSpec",
   "quote": "Marketed\nDecember 1990"},

  {"field": "EF 50mm f/1.8 II on Metabones EF-E (related)", "value": "Listed by Metabones as AF may not be accurate",
   "url": "https://www.metabones.com/products/details/mb-ef-e-bt5", "publisher": "Metabones", "kind": "manufacturerCompatTable",
   "quote": "AF may not be accurate, but may be usable on a camera with PDAF (GH7, OM-1. etc.)\nCanon EF 50mm f/1.8 II",
   "note": "Heading followed by the list item, under 'Limitations' in the lens compatibility section of the Mark V page."},

  {"field": "EF 50mm f/1.8 STM focusMotor", "value": "Gear-type STM",
   "url": "https://global.canon/en/c-museum/product/ef451.html", "publisher": "Canon Inc. (Canon Camera Museum)", "kind": "manufacturerSpec",
   "quote": "Equipped with a gear-type stepping-motor (STM) drive, the new EF50mm f/1.8 STM achieves autofocusing that is quieter than that realized by its predecessor. In addition, a full-time manual focusing function * allows users to focus manually after autofocusing, even when the lens is in AF Mode."},

  {"field": "EF 50mm f/1.8 STM focusMotor (spec row)", "value": "STM",
   "url": "https://www.canon-europe.com/lenses/ef-50mm-f-1-8-stm-lens/specification.html",
   "archivedAt": "https://web.archive.org/web/20240414114143/https://www.canon-europe.com/lenses/ef-50mm-f-1-8-stm-lens/specification.html",
   "publisher": "Canon Europe", "kind": "manufacturerSpec",
   "quote": "AF Actuator\nSTM"},

  {"field": "EF 50mm f/1.8 STM releaseYear", "value": "2015 (marketed May 2015)",
   "url": "https://global.canon/en/c-museum/product/ef451.html", "publisher": "Canon Inc. (Canon Camera Museum)", "kind": "manufacturerSpec",
   "quote": "Marketed\nMay 2015"},

  {"field": "EF 40mm f/2.8 STM focusMotor", "value": "STM; full-time manual",
   "url": "https://global.canon/en/c-museum/product/ef419.html", "publisher": "Canon Inc. (Canon Camera Museum)", "kind": "manufacturerSpec",
   "quote": "By incorporating an STM in the AF drive, the EF40mm f/2.8 STM makes possible even smoother, more silent AF operation compared with lenses that employ a DC motor, such as the EF-S18-55mm f/3.5-5.6 IS II (released in March of 2011). The new lens offers a minimum focusing distance of 0.3 m and includes such features as a full-time manual focus function."},

  {"field": "EF 40mm f/2.8 STM focusMotor (spec row)", "value": "STM",
   "url": "http://www.canon.co.uk/For_Home/Product_Finder/Cameras/EF_Lenses/Standard_and_Medium_Telephoto/EF_40mm_f_2.8_STM/index.aspx?specs=1",
   "archivedAt": "https://web.archive.org/web/20121017033804/http://www.canon.co.uk/For%5FHome/Product%5FFinder/Cameras/EF%5FLenses/Standard%5Fand%5FMedium%5FTelephoto/EF%5F40mm%5Ff%5F2.8%5FSTM/index.aspx?specs=1",
   "publisher": "Canon UK", "kind": "manufacturerSpec",
   "quote": "AF actuator\nSTM"},

  {"field": "EF 40mm f/2.8 STM releaseYear", "value": "2012 (marketed June 2012)",
   "url": "https://global.canon/en/c-museum/product/ef419.html", "publisher": "Canon Inc. (Canon Camera Museum)", "kind": "manufacturerSpec",
   "quote": "Marketed\nJune 2012"}
]
```

---

## 5. Mount flange focal distances

```json
[
  {"field": "Canon EF flangeMm", "value": 44,
   "url": "https://www.canon-europe.com/pro/infobank/rf-mount/",
   "archivedAt": "https://web.archive.org/web/20250115084851/https://www.canon-europe.com/pro/infobank/rf-mount/",
   "publisher": "Canon Europe", "kind": "manufacturerSpec",
   "quote": "The Canon RF mount retains the same wide 54mm diameter as the EF mount, but with a big reduction in the back focus distance – the distance between the mount and the sensor – from 44mm in the EF mount to 20mm in the RF mount.",
   "note": "Canon Europe calls it 'back focus distance' but defines it as mount-to-sensor, i.e. flange focal distance."},

  {"field": "Canon RF flangeMm", "value": 20,
   "url": "https://snapshot.canon-asia.com/article/eng/rf-lenses-vs-ef-lenses-whats-the-difference-and-how-to-decide", "publisher": "Canon Singapore (SNAPSHOT)", "kind": "manufacturerSpec",
   "quote": "The RF mount has a flange back distance of 20mm, but RF lenses can be designed with a back focus distance shorter than 20mm.",
   "note": "Same page defines: 'The flange back distance refers to the distance from the lens mount (on the camera side) to the image sensor.' Canon Europe quote above also gives 20mm."},

  {"field": "Canon EF-S flangeMm", "value": 44,
   "url": "https://en.wikipedia.org/wiki/Flange_focal_distance", "publisher": "Wikipedia", "kind": "other",
   "quote": "Canon EF-S-mount | 44.00 mm | SLR | APS-C | 2003–",
   "flag": "WIKIPEDIA_FALLBACK",
   "note": "No Canon page found giving an EF-S number. Canon's T5i spec says the EF-S body's mount is 'Canon EF mount', which is consistent with 44 mm but is not itself a quote of the number."},

  {"field": "Sony E flangeMm", "value": 18,
   "url": "https://en.wikipedia.org/wiki/Flange_focal_distance", "publisher": "Wikipedia", "kind": "other",
   "quote": "Sony E-mount | 18.00 mm | Mirrorless | APS-C | 2010–",
   "flag": "WIKIPEDIA_FALLBACK",
   "note": "No sony.com / sony.net page found stating the E-mount flange distance."},

  {"field": "Nikon F flangeMm", "value": 46.5,
   "url": "https://en.wikipedia.org/wiki/Flange_focal_distance", "publisher": "Wikipedia", "kind": "other",
   "quote": "Nikon F-mount | 46.50 mm | SLR | 24×36 mm / APS-C | 1959–",
   "flag": "WIKIPEDIA_FALLBACK",
   "note": "No Nikon page found stating 46.5 mm."},

  {"field": "Nikon Z flangeMm", "value": 16,
   "url": "https://www.nikonusa.com/learn-and-explore/c/products-and-innovation/nikon-z-series-z-mount-system", "publisher": "Nikon Inc. (USA)", "kind": "manufacturerSpec",
   "quote": "The system’s large lens mount features a 55mm inner diameter and short 16mm flange focal distance which allow for flexibility in the optical design of NIKKOR Z lenses; with maximum apertures as wide as f/0.95 possible."},

  {"field": "Micro Four Thirds flangeMm", "value": 19.25,
   "url": "https://en.wikipedia.org/wiki/Flange_focal_distance", "publisher": "Wikipedia", "kind": "other",
   "quote": "Micro Four Thirds System | 19.25 mm | Mirrorless | 4/3\" | 2008–",
   "flag": "WIKIPEDIA_FALLBACK",
   "note": "No OM System / Panasonic / four-thirds.org page found stating the number."},

  {"field": "L-Mount flangeMm", "value": 20,
   "url": "https://l-mount.com/en/overview-213", "publisher": "L-Mount Alliance", "kind": "manufacturerSpec",
   "quote": "The very short flange distance of 20 millimetres leads to a minimal distance between lens and sensor."},

  {"field": "Sigma SA flangeMm", "value": 44,
   "url": "https://en.wikipedia.org/wiki/Flange_focal_distance", "publisher": "Wikipedia", "kind": "other",
   "quote": "Sigma SA-mount | 44.00 mm | SLR | 24×36 mm / APS-C | 1992–",
   "flag": "WIKIPEDIA_FALLBACK",
   "note": "No sigma-global.com page found stating the SA flange distance."}
]
```

---

## 6. Sigma MOUNT CONVERTER MC-11 (EF-E and SA-E)

Sources actually read:
- Lens table: https://www.sigma-global.com/en/support/download/SIGMA_MC_11_lens_en.pdf (the URL requested; 1 page; no date or mount printed on it).
- Camera table: https://www.sigma-global.com/en/support/download/sigma_mc11_camera_en_ver3.pdf (linked from Sigma's accessories-compatibility page as "MOUNT CONVERTER MC-11(camera_compatibility)").
- The `table_id=11863` and `table_id=11862` URLs returned no table content (JavaScript-rendered).

Legend used in the lens PDF: `○` = supported, `×` = not supported. The PDF has no separate columns for EF vs SA mount.

```json
[
  {"field": "whatMC11Adapts", "value": "Sigma SA-mount and Sigma Canon-EOS-mount lenses to Sony E bodies",
   "url": "https://www.sigma-global.com/en/accessories/mc-11/", "publisher": "SIGMA Corporation", "kind": "manufacturerSpec",
   "quote": "The new MOUNT CONVERTER MC-11 allows you to use your SIGMA SA-mount and Sigma EOS mount interchangeable lenses with the Sony E-mount camera body."},

  {"field": "variants", "value": "SIGMA SA-E (UPC 00-85126-93251-0), CANON EF-E (UPC 00-85126-93250-3)",
   "url": "https://www.sigma-global.com/en/accessories/mc-11/", "publisher": "SIGMA Corporation", "kind": "manufacturerSpec",
   "quote": "MOUNT CONVERTER MC-11\nSIGMA SA-E\nSIGMA SA-mount\n00-85126-93251-0\nMOUNT CONVERTER MC-11\nCANON EF-E\nCanon EF mount\n00-85126-93250-3"},

  {"field": "AF behaviour by body", "value": "AF-S fast with Fast Hybrid AF bodies; contrast AF on others",
   "url": "https://www.sigma-global.com/en/accessories/mc-11/", "publisher": "SIGMA Corporation", "kind": "manufacturerSpec",
   "quote": "When used with a camera body that is compatible with Fast Hybrid AF, AF-S mode delivers extremely fast and smooth autofocus performance. With other camera bodies, contrast detection AF offers very high-precision autofocusing.* * Please see compatibility chart below"},

  {"field": "lensTable footnotes", "value": "AF-C/AF-A unsupported; DMF lens-dependent and needs USB DOCK; MF for movies",
   "url": "https://www.sigma-global.com/en/support/download/SIGMA_MC_11_lens_en.pdf", "publisher": "SIGMA Corporation", "kind": "manufacturerCompatTable",
   "quote": "※ AF-C and AF-A are not supported.\n※ Some lenses are not compatible with DMF.\n※ To use DMF, the settings must be changed using the USB DOCK (sold separately).\n※ Please use MF when shooting movies."},

  {"field": "cameraTable header + footnotes", "value": "General operation check only, as of June 2025; camera AF-C unsupported; no teleconverters; non-listed lenses not guaranteed",
   "url": "https://www.sigma-global.com/en/support/download/sigma_mc11_camera_en_ver3.pdf", "publisher": "SIGMA Corporation", "kind": "manufacturerCompatTable",
   "quote": "General operation check is done. It is not guaranteed for all function and performance.\nGeneral operation check done by SIGMA as of June 2025.\n[...]\n※ The camera's AF-C is not supported.\n※ Cannot be used with teleconverter.\n※ We do not guarantee the operation of lenses other than compatible lenses.",
   "publishedOn": "2025-06 (as-of date printed in the PDF)"},

  {"field": "nonSigmaLenses (e.g. Canon) not guaranteed", "value": "Sigma does not guarantee operation of lenses other than those on its compatible list",
   "url": "https://www.sigma-global.com/en/support/download/sigma_mc11_camera_en_ver3.pdf", "publisher": "SIGMA Corporation", "kind": "manufacturerCompatTable",
   "quote": "※ We do not guarantee the operation of lenses other than compatible lenses.",
   "note": "Closest official wording found. Sigma does not name Canon specifically; no Sigma page found that says 'Canon lenses' verbatim."},

  {"field": "compatibleSonyBodies", "value": "α1II, α1, α9II, α9, α7RV, α7RIV, α7RIII, α7RII, α7R, α7SIII, α7SII, α7S, α7CR, α7CII, α7C, α7IV, α7III, α7II, α7, α6700, α6600, α6500, α6400, α6300, α6100, α6000, α5100, α5000, ZV-E10, ZV-E1",
   "url": "https://www.sigma-global.com/en/support/download/sigma_mc11_camera_en_ver3.pdf", "publisher": "SIGMA Corporation", "kind": "manufacturerCompatTable",
   "quote": "α 1II\nα 1\nα 9II\nα 9\nα 7R Ⅴ\nα 7R Ⅳ\nα 7RIII\nα 7RII\nα 7R\nα 7SIII\nα 7SII\nα 7S\nα 7CR\nα 7C Ⅱ\nα 7C\nα 7 Ⅳ\nα 7 Ⅲ\nα 7 Ⅱ\nα 7\nα 6700\nα 6600\nα 6500\nα 6400\nα 6300\nα 6100\nα 6000\nα 5100\nα 5000\nZV-E10\nZV-E1",
   "note": "One body per row in the PDF, in this order. The PDF has NO per-body AF notes; the only AF note is the footnote 'The camera's AF-C is not supported.'",
   "publishedOn": "2025-06"}
]
```

Lens compatibility rows (from `SIGMA_MC_11_lens_en.pdf`, publisher SIGMA Corporation, kind manufacturerCompatTable). Each row is quoted exactly as it appears across the table columns `Product line | Category | Lens | AFS | AFC/AFA | DMF`. The PDF prints the product line once per group, so it is repeated here for clarity.

```json
[
  {"productLine": "Art", "category": "DC", "lens": "30mm F1.4 DC HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "×"},
  {"productLine": "Art", "category": "DC", "lens": "18-35mm F1.8 DC HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "×"},
  {"productLine": "Art", "category": "DC", "lens": "50-100mm F1.8 DC HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Art", "category": "DG", "lens": "12-24mm F4 DG HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Art", "category": "DG", "lens": "14-24mm F2.8 DG HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Art", "category": "DG", "lens": "24-35mm F2 DG HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Art", "category": "DG", "lens": "24-70mm F2.8 DG OS HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Art", "category": "DG", "lens": "24-105mm F4 DG OS HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "×"},
  {"productLine": "Art", "category": "DG", "lens": "14mm F1.8 DG HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Art", "category": "DG", "lens": "20mm F1.4 DG HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Art", "category": "DG", "lens": "24mm F1.4 DG HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Art", "category": "DG", "lens": "28mm F1.4 DG HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Art", "category": "DG", "lens": "35mm F1.4 DG HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "×"},
  {"productLine": "Art", "category": "DG", "lens": "40mm F1.4 DG HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Art", "category": "DG", "lens": "50mm F1.4 DG HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Art", "category": "DG", "lens": "70mm F2.8 DG MACRO", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Art", "category": "DG", "lens": "85mm F1.4 DG HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Art", "category": "DG", "lens": "105mm F1.4 DG HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Art", "category": "DG", "lens": "135mm F1.8 DG HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Contemporary", "category": "DC", "lens": "17-70mm F2.8-4 DC MACRO OS HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "×"},
  {"productLine": "Contemporary", "category": "DC", "lens": "18-200mm F3.5-6.3 DC MACRO OS HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "×"},
  {"productLine": "Contemporary", "category": "DC", "lens": "18-300mm F3.5-6.3 DC MACRO OS HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "×"},
  {"productLine": "Contemporary", "category": "DG", "lens": "100-400mm F5-6.3 DG OS HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Contemporary", "category": "DG", "lens": "150-600mm F5-6.3 DG OS HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Sports", "category": "DG", "lens": "60-600mm F4.5-6.3 DG OS HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Sports", "category": "DG", "lens": "70-200mm F2.8 DG OS HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Sports", "category": "DG", "lens": "120-300mm F2.8 DG OS HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "×"},
  {"productLine": "Sports", "category": "DG", "lens": "150-600mm F5-6.3 DG OS HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"},
  {"productLine": "Sports", "category": "DG", "lens": "500mm F4 DG OS HSM", "AFS": "○", "AFC_AFA": "×", "DMF": "○"}
]
```

Caveat on the product-line grouping: the PDF prints "Art", "Contemporary" and "Sports" once per group, vertically centred, not on every row. Groups were assigned by position: "Art" sits at y=335, the midpoint of the 19 rows from 30mm (y=171) to 135mm (y=498); "Contemporary" at y=552, the midpoint of the 5 rows 17-70mm to 150-600mm (y=516 to 589); "Sports" at y=643, the midpoint of the 5 rows 60-600mm to 500mm (y=607 to 679). The per-lens AFS / AFC_AFA / DMF values do not depend on this.

---

## 7. Canon Mount Adapter EF-EOS R

```json
[
  {"field": "EF/EF-S compatibility on RF bodies", "value": "Full compatibility with EF and EF-S lenses via the adapters",
   "url": "https://www.canon-europe.com/lenses/eos-r-adapters/",
   "archivedAt": "https://web.archive.org/web/20250119092233/https://www.canon-europe.com/lenses/eos-r-adapters/",
   "publisher": "Canon Europe", "kind": "manufacturerSpec",
   "quote": "The EOS R System adapters offer full compatibility with Canon EF and EF-S lenses giving Canon EOS R System camera owners who also own other EOS cameras complete integration with their existing lenses 1 .",
   "note": "Footnote 1's text was not present in the archived capture."},

  {"field": "EF-EOS R seamless use", "value": "EF and EF-S lenses work as expected on EOS R",
   "url": "https://www.canon-europe.com/lenses/eos-r-adapters/",
   "archivedAt": "https://web.archive.org/web/20250119092233/https://www.canon-europe.com/lenses/eos-r-adapters/",
   "publisher": "Canon Europe", "kind": "manufacturerSpec",
   "quote": "The standard Mount Adapter EF-EOS R allows EF-S and EF lenses to be used on EOS R cameras seamlessly. Photographers who already have a collection of EF-S or EF optics can invest in the EOS R System confidently, knowing their existing lenses will work as expected."},

  {"field": "fullAF explicitly", "value": "NOT FOUND as a verbatim 'full AF' sentence",
   "url": null, "publisher": null, "kind": null, "quote": null,
   "note": "Canon says 'full compatibility' and 'work as expected'. No retrieved Canon page says 'full autofocus' in so many words. The R1 manual (below) says AF works with the lens switch at AF."},

  {"field": "EF-S on full-frame RF body -> automatic crop", "value": "Camera automatically crops to the EF-S image circle",
   "url": "https://www.canon-europe.com/lenses/eos-r-adapters/",
   "archivedAt": "https://web.archive.org/web/20250119092233/https://www.canon-europe.com/lenses/eos-r-adapters/",
   "publisher": "Canon Europe", "kind": "manufacturerSpec",
   "quote": "EF-S lenses are designed for APS-C sensor EOS DSLRs, but they can also be used on EOS R System cameras via adapter. The camera will automatically produce cropped images that match the smaller image circle of EF-S optics."},

  {"field": "EF-S crop factor on RF body", "value": "approx. 1.6x applied automatically",
   "url": "https://cam.start.canon/en/C018/manual/html/UG-01_Preparations_0080.html", "publisher": "Canon Inc. (EOS R1 Advanced User Guide, Attaching and Detaching EF/EF-S Lenses)", "kind": "manual",
   "quote": "All EF and EF-S lenses can be used by attaching an optional Mount Adapter EF-EOS R . The camera cannot be used with EF-M lenses.\nWith EF-S lenses, an approx. 1.6× crop factor is applied to the center of the regular image area.",
   "note": "EOS R1 manual. The original EOS R manual reportedly says '[1.6x (crop)] is set automatically' (ManualsLib, p.80), but that was not retrieved from a Canon host, so it is not recorded as a sourced quote."}
]
```

---

## 8. Metabones Canon EF to Sony E Mount T Smart Adapter (Mark V), MB_EF-E-BT5

```json
[
  {"field": "productPage", "value": "https://www.metabones.com/products/details/mb-ef-e-bt5",
   "url": "https://www.metabones.com/products/details/mb-ef-e-bt5", "publisher": "Metabones", "kind": "manufacturerSpec",
   "quote": "Canon EF Lens to Sony E Mount T Smart Adapter (Mark V)"},

  {"field": "AF features", "value": "AF-C up to 10fps, continuous video AF, PDAF",
   "url": "https://www.metabones.com/products/details/mb-ef-e-bt5", "publisher": "Metabones", "kind": "manufacturerSpec",
   "quote": "AF-C tracking at up to 10fps.\nContinuous video AF.\nPhase-detection autofocus (PDAF)."},

  {"field": "AF by camera generation: modern (2015+) PDAF bodies", "value": "Green: fast PDAF stills, poor/no video AF. Advanced: hybrid PDAF+CDAF stills, continuous video AF with PDAF",
   "url": "https://www.metabones.com/article/of/green-power-save-mode", "publisher": "Metabones", "kind": "manufacturerCompatTable",
   "quote": "The following table summarizes the differences between the two operation modes if your camera is modern (2015+) and supports PDAF (phase-detection autofocus) .\n[...]\nGreen Mode\nAdvanced Mode\nStill photo: fast phase-detection autofocus\nStill photo: fast hybrid (contrast-detection+phase detection) autofocus.\n[...]\nSlow, disruptive single-shot video AF or no video AF at all\nContinuous video AF with phase-detection AF on supported cameras",
   "note": "Two-column table flattened to text: each pair of lines is Green then Advanced."},

  {"field": "AF by camera generation: legacy (2014 or before) or no-PDAF bodies (e.g. A7S II)", "value": "Green: slow CDAF, no AF-C. Advanced: fast CDAF with most EF lenses, AF-C may hunt",
   "url": "https://www.metabones.com/article/of/green-power-save-mode", "publisher": "Metabones", "kind": "manufacturerCompatTable",
   "quote": "For legacy cameras (2014 or before), or for cameras with no phase-detection autofocus (e.g. A7S II),\nGreen Mode\nAdvanced Mode\nSlow contrast-detection autofocus\nFast contrast-detection autofocus with most Canon EF mount lenses. Contax N lenses may not autofocus properly in Advanced mode.\nNo AF-C support\nAF-C may have unsatisfactory performance and/or accuracy and may suffer from excessive hunting, depending on lens - use AF-S or DMF\n[...]\nWe recommend users of legacy cameras or cameras with no PDAF to use the \"Advanced\" mode."},

  {"field": "Mark V default mode", "value": "Advanced",
   "url": "https://www.metabones.com/article/of/green-power-save-mode", "publisher": "Metabones", "kind": "manufacturerSpec",
   "quote": "Every recently shipped Mark V defaults to Advanced Mode."},

  {"field": "AF aperture limit", "value": "f/8 or brighter",
   "url": "https://www.metabones.com/products/details/mb-ef-e-bt5", "publisher": "Metabones", "kind": "manufacturerSpec",
   "quote": "AF may not work if the maximum aperture of the lens plus any EF Extender or other teleconverter attached is smaller than f/8."},

  {"field": "video AF noise with EF lenses", "value": "Lens AF/iris noise may be recorded",
   "url": "https://www.metabones.com/products/details/mb-ef-e-bt5", "publisher": "Metabones", "kind": "manufacturerSpec",
   "quote": "Some EF-mount lenses may make audible noises during iris changes and autofocus, which may be picked up by the built-in microphone of the camera during video recording. Use of an external microphone is advised. Some of the recently-introduced lenses are very quiet, however."},

  {"field": "EF-S lenses", "value": "Fits EF and EF-S; auto APS-C crop on full-frame",
   "url": "https://www.metabones.com/products/details/mb-ef-e-bt5", "publisher": "Metabones", "kind": "manufacturerSpec",
   "quote": "Auto APS-C Size Capture on full-frame cameras with Canon EF-S lenses and many third-party DX lenses.\n[...]\nFits both EF and EF-S lenses. (Vignetting at corners may occur with certain EF-S lenses because they are designed to cover a 1.6x crop image circle but Sony APS-C has a 1.5x crop factor.)"},

  {"field": "testedCameraBodies", "value": "see quote",
   "url": "https://www.metabones.com/products/details/mb-ef-e-bt5", "publisher": "Metabones", "kind": "manufacturerCompatTable",
   "quote": "Tested Camera Bodies:\nSony alpha A1 II, A1, A9 III, A9 II, A9, A7R VI, A7R V, A7R IV, A7R III, A7R II, A7R, A7CR, A7C II, A7C, A7S III, A7S II, A7S, A7V, A7IV, A7III, A7II, A7\nA6700, A6600, A6500, A6400, A6300, A6000, A5000\nZV-E1, ZV-E10 II, ZV-E10 *\nILME-FX2, FX3, FX30 *\nPXW-FX9, FX6 *\nPXW-FS5M2, PXW-FS7M2, PXW-FS5, PXW-FS7, NEX-FS700, NEX-FS100\nVENICE *\nNEX-EA50, NEX-VG900, NEX-VG30, NEX-VG20, NEX-VG10\nNEX-7, NEX-6, NEX-5R, NEX-5N, NEX-5, NEX-C3, NEX-3\n* for using the VENICE, FX and FS series cameras, please switch the adapter to Advance Mode (LED in red colour).\nNot recommended:\nZV-E10 II (we received a report of poor video AF performance)"},

  {"field": "lensCompatibilityList", "value": "On the same product page (no separate URL): category list of compatible lenses, 'No AF Support' list and 'AF may not be accurate' list",
   "url": "https://www.metabones.com/products/details/mb-ef-e-bt5", "publisher": "Metabones", "kind": "manufacturerCompatTable",
   "quote": "Lens Compatibility List\nCompatible Lenses\nIncompatible Lenses\nCanon CN Cinema Lens\nCanon EF Lens\nCanon EF-S Lens\nCanon EF Extender\nCarl Zeiss ZE Lens\nSigma EF Lens\nTamron EF Lens\nTokina EF Lens\nContax N lenses modified by Conurus",
   "note": "Page tabs flattened. 'No AF Support' lists Tamron SP 17-50mm F/2.8VC B005, Tamron 28-300mm F/3.5-6.3 VC A20, Sigma 18-125mm F/3.5-5.6DC OS HSM. 'AF may not be accurate' lists Canon EF 50mm f/1.8 II, Canon EF 28-70mm f/3.5-4.5 II, Sigma 50mm f/1.4 EX HSM, Sigma 90mm F/2.8 macro (1988), Tamron A18, B008, A007, A06, Tokina AT-X PRO 11-16mm f/2.8 DX (I)."},

  {"field": "AF by specific Sony body model (per-model table)", "value": "NOT FOUND",
   "url": "http://www.metabones.com/assets/p/ef_e_matrix6.jpg", "publisher": "Metabones", "kind": null, "quote": null,
   "note": "Metabones publishes AF behaviour by generation (modern 2015+ PDAF vs legacy 2014-or-earlier / no-PDAF), quoted above, not per body model. The 'EF-E Product Matrix' image compares adapter models (EF-S compatible, IBIS switch, etc.) and has no AF-by-body rows."}
]
```

---

## Summary of NOT FOUND items

1. A Canon statement that Movie Servo AF works with **all** EF lenses (only "with certain lenses, the lens mechanical sound during focusing may be recorded").
2. A Canon statement that the EF-S 18-55 IS II manual focus ring is **mechanical** (only that MF requires the switch at MF and that focus must not be turned in AF).
3. Any T5i/700D/X7i kit bundled with the EF-S 18-55 IS II.
4. A T5i-specific Canon page that spells out "phase + contrast" for Hybrid CMOS AF (the general Canon statement and the T4i museum page are used instead).
5. A Canon sentence saying EF-EOS R gives "full AF" verbatim ("full compatibility" is what Canon says).
6. Manufacturer sources for flange distance of Canon EF-S, Sony E, Nikon F, Micro Four Thirds and Sigma SA (Wikipedia fallback, flagged).
7. Sigma naming Canon lenses specifically as not guaranteed (Sigma's wording is "lenses other than compatible lenses").
8. A Metabones per-Sony-model AF table (published by generation instead).
