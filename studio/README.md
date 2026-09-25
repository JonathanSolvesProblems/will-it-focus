# studio

The Sanity Studio and schema for project `qnl9jh8n`. Deployed at https://will-it-focus.sanity.studio

- `schemaTypes/`: mount, sensorFormat, body, lens, adapter, compatibilityRecord, focusCaveat, and the `source` object every fact carries
- `npm run dev` runs it locally; `npx sanity schema deploy` publishes the schema Sanity Context reads in GROQ mode
- Records are not edited here. They are built by `../data/build-records.mjs` and imported with `npx sanity dataset import ../data/records.ndjson production --replace`
