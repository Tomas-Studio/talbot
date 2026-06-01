import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons'

export const projectCategory = defineType({
  name: 'projectCategory',
  title: 'Project Category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'showcaseMedia',
      title: 'Showcase Media',
      description: 'Image or video displayed on the homepage carousel for this category',
      type: 'media',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.required().integer().min(0),
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'showcaseMedia.image',
      order: 'order',
    },
    prepare({title, media, order}) {
      return {
        title,
        subtitle: `Order: ${order ?? 0}`,
        media,
      }
    },
  },
})
