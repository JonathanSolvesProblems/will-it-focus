import {defineField, defineType} from 'sanity'

const afSupport = {
  list: [
    {title: 'Supported', value: 'supported'},
    {title: 'Supported with limits', value: 'limited'},
    {title: 'Not supported', value: 'notSupported'},
    {title: 'Not stated by the source', value: 'unknown'},
  ],
}

// One published statement about how a lens, body and (optionally) adapter behave together.
// A record is only as wide as its source: a table row about one lens references one lens,
// a blanket statement ("all EF lenses") says so in scope instead of listing every lens.
export const compatibilityRecord = defineType({
  name: 'compatibilityRecord',
  title: 'Compatibility record',
  type: 'document',
  fields: [
    defineField({
      name: 'scope',
      type: 'string',
      options: {
        list: [
          {title: 'The specific lenses listed', value: 'listedLenses'},
          {title: 'Every lens on the lens mount', value: 'allLensesOnMount'},
          {title: 'Lenses with a given focus motor', value: 'byFocusMotor'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'lenses', type: 'array', of: [{type: 'reference', to: [{type: 'lens'}]}]}),
    defineField({name: 'lensMount', type: 'reference', to: [{type: 'mount'}]}),
    defineField({
      name: 'focusMotor',
      type: 'string',
      description: 'Only for scope "byFocusMotor". Same values as lens.focusMotor.',
    }),
    defineField({
      name: 'bodies',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'body'}]}],
      description: 'Empty means the source did not limit the statement to particular bodies.',
    }),
    defineField({
      name: 'bodyCondition',
      type: 'string',
      description:
        'When the source limits the statement by body generation instead of naming models, e.g. "2015 or later with phase-detect AF".',
    }),
    defineField({
      name: 'adapters',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'adapter'}]}],
      description: 'Empty means native mount, no adapter. More than one when the source covers every variant.',
    }),
    defineField({
      name: 'shootingMode',
      type: 'string',
      options: {list: ['viewfinderPhoto', 'liveViewPhoto', 'video', 'any']},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'singleAf', title: 'Single-shot AF', type: 'string', options: afSupport}),
    defineField({name: 'continuousAf', title: 'Continuous AF', type: 'string', options: afSupport}),
    defineField({
      name: 'dmf',
      title: 'Direct manual focus (DMF)',
      type: 'string',
      options: afSupport,
      description: 'Manual touch-up after AF locks. Only when the source has a DMF column or says so.',
    }),
    defineField({
      name: 'behaviour',
      type: 'string',
      description: 'How it focuses, when the source says: smooth and quiet, audible, hunts.',
      options: {list: ['smoothQuiet', 'audible', 'hunts', 'slow', 'unknown']},
    }),
    defineField({name: 'note', type: 'text', rows: 3}),
    defineField({name: 'source', type: 'source', validation: (rule) => rule.required()}),
  ],
  preview: {
    select: {mode: 'shootingMode', single: 'singleAf', cont: 'continuousAf', pub: 'source.publisher'},
    prepare: ({mode, single, cont, pub}) => ({
      title: `${mode ?? '?'}: single ${single ?? '?'}, continuous ${cont ?? '?'}`,
      subtitle: pub,
    }),
  },
})
