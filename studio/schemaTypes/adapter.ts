import {defineField, defineType} from 'sanity'

// A mount adapter joins a lens mount to a body mount. Whether autofocus survives the trip
// is not a property of the adapter alone; it lives in compatibilityRecord documents.
export const adapter = defineType({
  name: 'adapter',
  title: 'Mount adapter',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'maker', type: 'string'}),
    defineField({name: 'lensMount', title: 'Lens side', type: 'reference', to: [{type: 'mount'}]}),
    defineField({name: 'bodyMount', title: 'Body side', type: 'reference', to: [{type: 'mount'}]}),
    defineField({
      name: 'electronic',
      type: 'boolean',
      description: 'Passes autofocus and aperture control. A dumb adapter means manual focus only.',
    }),
    defineField({
      name: 'optics',
      type: 'string',
      options: {list: ['none', 'focalReducer', 'teleconverter', 'unknown']},
    }),
    defineField({
      name: 'opticsFactor',
      type: 'number',
      description: 'e.g. 0.71 for a focal reducer. Empty when there are no optics.',
    }),
    defineField({
      name: 'testedBodies',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'body'}]}],
      description: "Bodies the adapter's maker lists as checked. Its sources say where the list comes from.",
    }),
    defineField({name: 'sources', type: 'array', of: [{type: 'source'}]}),
  ],
  preview: {select: {title: 'name', subtitle: 'maker'}},
})
