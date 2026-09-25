import {defineField, defineType} from 'sanity'

// A sensor size. Bodies record the format they have; lenses record the format they cover.
// A lens covering a smaller format than the body vignettes or forces a crop mode.
export const sensorFormat = defineType({
  name: 'sensorFormat',
  title: 'Sensor format',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'widthMm', type: 'number'}),
    defineField({name: 'heightMm', type: 'number'}),
    defineField({
      name: 'cropFactor',
      type: 'number',
      description: 'Relative to 36x24 mm full frame.',
    }),
    defineField({name: 'sources', type: 'array', of: [{type: 'source'}]}),
  ],
})
