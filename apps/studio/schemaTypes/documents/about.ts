import {defineArrayMember, defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons'

export const about = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  icon: UserIcon,
  groups: [
    {name: 'intro', title: 'Intro', default: true},
    {name: 'story', title: 'Story'},
    {name: 'expertise', title: 'Expertise'},
    {name: 'experience', title: 'Experience'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      group: 'intro',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      description: 'Short statement shown at the top, e.g. "Product Designer based in Lagos"',
      type: 'string',
      group: 'intro',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      description: 'A brief opening paragraph that introduces who you are',
      type: 'text',
      rows: 4,
      group: 'intro',
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'media',
      group: 'intro',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      description: 'The longer story — background, what drives your work, how you got here',
      type: 'text',
      rows: 10,
      group: 'story',
    }),
    defineField({
      name: 'philosophy',
      title: 'Philosophy',
      description: 'Your approach or working principles',
      type: 'text',
      rows: 6,
      group: 'story',
    }),
    defineField({
      name: 'services',
      title: 'Services',
      description: 'Disciplines you offer. Type to add a tag.',
      type: 'array',
      group: 'expertise',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'skills',
      title: 'Tools & Skills',
      description: 'Software, methods, and skills. Type to add a tag.',
      type: 'array',
      group: 'expertise',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'clients',
      title: 'Selected Clients',
      description: 'Notable clients or brands you have worked with',
      type: 'array',
      group: 'expertise',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'experience',
      title: 'Experience',
      description: 'Roles and positions over time',
      type: 'array',
      group: 'experience',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'position',
          fields: [
            defineField({
              name: 'role',
              title: 'Role',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'company',
              title: 'Company',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'period',
              title: 'Period',
              description: 'e.g. "2021 — Present" or "2018 — 2021"',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
            }),
          ],
          preview: {
            select: {title: 'role', company: 'company', period: 'period'},
            prepare({title, company, period}) {
              return {
                title: [title, company].filter(Boolean).join(' · '),
                subtitle: period,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'awards',
      title: 'Awards & Recognition',
      description: 'e.g. "Awwwards Site of the Day", "Behance Featured"',
      type: 'array',
      group: 'experience',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'resume',
      title: 'Resume / CV',
      description: 'Downloadable resume file',
      type: 'file',
      group: 'experience',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
        }),
        defineField({
          name: 'ogImage',
          title: 'Social Share Image',
          description: 'Shown in link previews (1200x630 recommended)',
          type: 'image',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'headline',
      media: 'portrait.image',
    },
    prepare({title, subtitle, media}) {
      return {
        title: title ?? 'About',
        subtitle,
        media,
      }
    },
  },
})
