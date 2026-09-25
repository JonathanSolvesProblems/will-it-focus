import {defineField, defineType} from 'sanity'

// A published reason focus goes wrong under a specific condition, with the maker's own remedy.
// compatibilityRecord says whether AF works; focusCaveat says why it may still miss.
export const focusCaveat = defineType({
  name: 'focusCaveat',
  title: 'Focus caveat',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'bodies',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'body'}]}],
      description: 'Empty means the source did not limit it to particular bodies.',
    }),
    defineField({
      name: 'lenses',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'lens'}]}],
      description: 'Only when the source names lenses. Empty means any lens.',
    }),
    defineField({
      name: 'shootingMode',
      type: 'string',
      options: {list: ['viewfinderPhoto', 'liveViewPhoto', 'video', 'any']},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'appliesWhen',
      type: 'string',
      description: 'The camera setting or condition, e.g. "Basic Zone (auto) modes", "FlexiZone AF methods".',
    }),
    defineField({
      name: 'effect',
      type: 'string',
      options: {
        list: [
          {title: 'Focuses on the wrong subject', value: 'wrongSubject'},
          {title: 'Slow, or fails to focus', value: 'slowOrFails'},
          {title: 'Hunts back and forth', value: 'hunts'},
          {title: 'Focus motor noise recorded', value: 'audibleNoise'},
          {title: 'Autofocus unavailable', value: 'noAf'},
          {title: 'Other', value: 'other'},
        ],
      },
    }),
    defineField({
      name: 'remedy',
      type: 'text',
      rows: 2,
      description: "The maker's own fix, if the source gives one. Empty rather than invented.",
    }),
    defineField({name: 'source', type: 'source', validation: (rule) => rule.required()}),
  ],
  preview: {select: {title: 'title', subtitle: 'appliesWhen'}},
})
