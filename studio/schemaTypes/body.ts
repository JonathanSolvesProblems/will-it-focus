import {defineField, defineType} from 'sanity'

const unknown = {title: 'Not stated by any source', value: 'unknown'}

// A camera body. The autofocus system is split by how the photographer is shooting,
// because the same body can focus one way through the viewfinder and another in video.
export const body = defineType({
  name: 'body',
  title: 'Camera body',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'aliases',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Regional names for the same camera, e.g. Rebel T5i / EOS 700D / Kiss X7i.',
    }),
    defineField({name: 'maker', type: 'string'}),
    defineField({name: 'releaseYear', type: 'number'}),
    defineField({name: 'mount', type: 'reference', to: [{type: 'mount'}]}),
    defineField({name: 'sensorFormat', type: 'reference', to: [{type: 'sensorFormat'}]}),
    defineField({
      name: 'viewfinderAf',
      title: 'Autofocus through the viewfinder',
      type: 'string',
      options: {
        list: [
          {title: 'Dedicated phase-detect module', value: 'phaseDetectModule'},
          {title: 'No optical viewfinder', value: 'none'},
          unknown,
        ],
      },
    }),
    defineField({
      name: 'liveViewAf',
      title: 'Autofocus in live view and video',
      type: 'string',
      options: {
        list: [
          {title: 'Contrast detect only', value: 'contrast'},
          {title: 'Hybrid (on-sensor phase + contrast)', value: 'hybrid'},
          {title: 'Dual Pixel CMOS AF', value: 'dualPixel'},
          {title: 'Dual Pixel CMOS AF II', value: 'dualPixelII'},
          {title: 'On-sensor phase detect', value: 'onSensorPhase'},
          unknown,
        ],
      },
    }),
    defineField({
      name: 'liveViewAfName',
      type: 'string',
      description: "The maker's own name for it, e.g. Hybrid CMOS AF, Fast Hybrid AF.",
    }),
    defineField({
      name: 'videoContinuousAf',
      title: 'Continuous autofocus while recording',
      type: 'string',
      options: {list: ['yes', 'no', 'unknown']},
    }),
    defineField({
      name: 'videoContinuousAfName',
      type: 'string',
      description: 'e.g. Movie Servo AF, AF-C.',
    }),
    defineField({name: 'sources', type: 'array', of: [{type: 'source'}]}),
  ],
  preview: {select: {title: 'name', subtitle: 'maker'}},
})
