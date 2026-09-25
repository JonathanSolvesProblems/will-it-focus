import {defineField, defineType} from 'sanity'

// A lens mount. Flange distance is what decides whether an adapter can exist at all:
// a lens can only be adapted onto a body whose flange distance is shorter.
export const mount = defineType({
  name: 'mount',
  title: 'Mount',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'name'}}),
    defineField({name: 'maker', type: 'string'}),
    defineField({
      name: 'system',
      type: 'string',
      options: {list: ['dslr', 'mirrorless', 'cinema', 'other']},
    }),
    defineField({
      name: 'flangeDistanceMm',
      type: 'number',
      description: 'Mount flange to sensor, in mm. Empty if no manufacturer or standard source states it.',
    }),
    defineField({name: 'throatDiameterMm', type: 'number'}),
    defineField({
      name: 'electronicContacts',
      type: 'boolean',
      description: 'Whether the mount passes power and autofocus commands to the lens.',
    }),
    defineField({
      name: 'acceptsLensMounts',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'mount'}]}],
      description:
        'Lens mounts a body with this mount takes natively, including itself. An EF-S body takes EF and EF-S lenses.',
    }),
    defineField({name: 'sources', type: 'array', of: [{type: 'source'}]}),
  ],
  preview: {select: {title: 'name', subtitle: 'maker'}},
})
