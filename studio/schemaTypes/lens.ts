import {defineField, defineType} from 'sanity'

// A lens. The focus motor is the field that answers most "why does my camera hunt" questions,
// so it is an enum rather than free text, and "unknown" is a legal value.
export const lens = defineType({
  name: 'lens',
  title: 'Lens',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'aliases', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'maker', type: 'string'}),
    defineField({name: 'releaseYear', type: 'number'}),
    defineField({name: 'mount', type: 'reference', to: [{type: 'mount'}]}),
    defineField({
      name: 'imageCircle',
      title: 'Largest sensor format it covers',
      type: 'reference',
      to: [{type: 'sensorFormat'}],
    }),
    defineField({name: 'focalMinMm', type: 'number'}),
    defineField({name: 'focalMaxMm', type: 'number'}),
    defineField({name: 'maxApertureWide', type: 'number', description: 'f-number at the wide end.'}),
    defineField({
      name: 'focusMotor',
      type: 'string',
      options: {
        list: [
          {title: 'Stepping motor (STM)', value: 'stm'},
          {title: 'Ring USM', value: 'ringUsm'},
          {title: 'Micro USM', value: 'microUsm'},
          {title: 'Nano USM', value: 'nanoUsm'},
          {title: 'DC micro-motor', value: 'microMotor'},
          {title: 'Linear motor', value: 'linear'},
          {title: 'HSM (Sigma)', value: 'hsm'},
          {title: 'No motor (manual focus only)', value: 'none'},
          {title: 'Other', value: 'other'},
          {title: 'Not stated by any source', value: 'unknown'},
        ],
      },
    }),
    defineField({name: 'focusMotorDetail', type: 'string'}),
    defineField({
      name: 'manualFocusRing',
      type: 'string',
      options: {
        list: [
          {title: 'Mechanical', value: 'mechanical'},
          {title: 'Focus-by-wire (needs power)', value: 'byWire'},
          {title: 'Not stated by any source', value: 'unknown'},
        ],
      },
    }),
    defineField({name: 'sources', type: 'array', of: [{type: 'source'}]}),
  ],
  preview: {select: {title: 'name', subtitle: 'focusMotor'}},
})
