import {defineField, defineType} from 'sanity'
import {PlayIcon} from '@sanity/icons'

export const media = defineType({
  name: 'media',
  title: 'Media',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'type',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          {title: 'Image', value: 'image'},
          {title: 'Video', value: 'video'},
        ],
        layout: 'radio',
      },
      initialValue: 'image',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      hidden: ({parent}) => parent?.type !== 'image',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as {type?: string}
          if (parent?.type === 'image' && !value) return 'Image is required'
          return true
        }),
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (rule) => rule.required().error('Alt text is required for accessibility'),
        }),
      ],
    }),
    defineField({
      name: 'video',
      title: 'Video File',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      hidden: ({parent}) => parent?.type !== 'video',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as {type?: string}
          if (parent?.type === 'video' && !value) return 'Video file is required'
          return true
        }),
    }),
  ],
  preview: {
    select: {
      type: 'type',
      imageUrl: 'image',
    },
    prepare({type, imageUrl}) {
      return {
        title: type === 'image' ? 'Image' : 'Video',
        media: type === 'image' ? imageUrl : PlayIcon,
      }
    },
  },
})
