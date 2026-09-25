import {defineField, defineType} from 'sanity'

// Every fact in the dataset carries the page it came from. The agent quotes these,
// so a claim with no source is not a claim this system can make.
export const source = defineType({
  name: 'source',
  title: 'Source',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publisher',
      type: 'string',
      description: 'Who published the page, e.g. Canon, Sigma, Metabones, Sony.',
    }),
    defineField({
      name: 'kind',
      type: 'string',
      options: {
        list: [
          {title: 'Manufacturer spec page', value: 'manufacturerSpec'},
          {title: 'Manufacturer compatibility table', value: 'manufacturerCompatTable'},
          {title: 'Manual or support note', value: 'manual'},
          {title: 'Independent review', value: 'review'},
          {title: 'Other', value: 'other'},
        ],
      },
    }),
    defineField({name: 'title', type: 'string'}),
    defineField({
      name: 'quote',
      type: 'text',
      rows: 3,
      description: 'The exact sentence or table cell this fact rests on, copied verbatim.',
    }),
    defineField({
      name: 'page',
      type: 'number',
      description: 'Page number in the PDF, when the source is a PDF.',
    }),
    defineField({
      name: 'publishedOn',
      type: 'date',
      description: 'Publication date if the page states one. Leave empty rather than guess.',
    }),
    defineField({
      name: 'retrievedOn',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {select: {title: 'publisher', subtitle: 'url'}},
})
