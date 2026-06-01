import {defineField, defineType} from 'sanity'
import {DocumentsIcon} from '@sanity/icons'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: DocumentsIcon,
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
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
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
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (rule) => rule.required().integer().min(2000).max(2100),
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'projectCategory'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'projectUrl',
      title: 'Project URL',
      type: 'url',
      validation: (rule) =>
        rule.uri({scheme: ['http', 'https']}).error('Must be a valid URL'),
    }),
  ],
  orderings: [
    {
      title: 'Year (Newest)',
      name: 'yearDesc',
      by: [{field: 'year', direction: 'desc'}],
    },
    {
      title: 'Year (Oldest)',
      name: 'yearAsc',
      by: [{field: 'year', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      year: 'year',
      client: 'client',
      media: 'thumbnail',
    },
    prepare({title, year, client, media}) {
      return {
        title,
        subtitle: `${year} - ${client}`,
        media,
      }
    },
  },
})
