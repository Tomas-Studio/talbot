import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentsIcon} from '@sanity/icons'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: DocumentsIcon,
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'caseStudy', title: 'Case Study'},
    {name: 'credits', title: 'Credits & Links'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'overview',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'overview',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'synopsis',
      title: 'Synopsis',
      description: 'Short summary shown on listing cards and at the top of the case study',
      type: 'text',
      rows: 4,
      group: 'overview',
    }),
    defineField({
      name: 'cover',
      title: 'Cover',
      type: 'media',
      group: 'overview',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      group: 'overview',
      validation: (rule) => rule.required().integer().min(2000).max(2100),
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      description: 'How long the project took, e.g. "6 weeks" or "3 months"',
      type: 'string',
      group: 'overview',
    }),
    defineField({
      name: 'client',
      title: 'Client',
      description: 'Leave empty for personal or self-initiated projects',
      type: 'string',
      group: 'overview',
    }),
    defineField({
      name: 'role',
      title: 'My Role',
      description: 'Your role on the project, e.g. "Lead Product Designer"',
      type: 'string',
      group: 'overview',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      group: 'overview',
      to: [{type: 'projectCategory'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'services',
      title: 'Services',
      description:
        'Disciplines covered on this project. Type to add a tag — common ones: UX Research, UX Design, UI Design, Brand Identity, Art Direction, Graphic Design, Illustration, Motion Design, Web Design, Print Design, Packaging, Design System.',
      type: 'array',
      group: 'overview',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      description: 'Show this project in featured spots like the homepage carousel',
      type: 'boolean',
      group: 'overview',
      initialValue: false,
    }),
    defineField({
      name: 'themeColor',
      title: 'Theme Color',
      description: 'Accent color for the project page, as a hex code e.g. #FF5733',
      type: 'string',
      group: 'overview',
      validation: (rule) =>
        rule
          .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
          .error('Must be a hex color, e.g. #FF5733'),
    }),
    defineField({
      name: 'challenge',
      title: 'Challenge',
      description: 'The problem or brief — what needed to be solved',
      type: 'text',
      rows: 5,
      group: 'caseStudy',
    }),
    defineField({
      name: 'approach',
      title: 'Approach',
      description: 'How you tackled the problem — process, decisions, craft',
      type: 'text',
      rows: 5,
      group: 'caseStudy',
    }),
    defineField({
      name: 'result',
      title: 'Result',
      description: 'The outcome — what shipped and the impact it had',
      type: 'text',
      rows: 5,
      group: 'caseStudy',
    }),
    defineField({
      name: 'highlight',
      title: 'Highlight',
      description: 'A standout takeaway or pull quote for the project',
      type: 'text',
      rows: 3,
      group: 'caseStudy',
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      description: 'Additional images and videos shown after the case study',
      type: 'array',
      group: 'caseStudy',
      of: [{type: 'media'}],
    }),
    defineField({
      name: 'testimonial',
      title: 'Testimonial',
      type: 'object',
      group: 'caseStudy',
      fields: [
        defineField({
          name: 'quote',
          title: 'Quote',
          type: 'text',
          rows: 3,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'author',
          title: 'Author',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'authorRole',
          title: 'Author Role',
          description: 'e.g. "CEO, Acme Inc."',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'awards',
      title: 'Awards & Recognition',
      description: 'e.g. "Awwwards Site of the Day", "Behance Featured"',
      type: 'array',
      group: 'caseStudy',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'team',
      title: 'Team',
      description: 'Collaborators on the project',
      type: 'array',
      group: 'credits',
      of: [
        defineField({
          name: 'member',
          title: 'Member',
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'role',
              title: 'Role',
              type: 'string',
            }),
          ],
          preview: {
            select: {title: 'name', subtitle: 'role'},
          },
        }),
      ],
    }),
    defineField({
      name: 'liveUrl',
      title: 'Live Site',
      description: 'Link to the live project, if available',
      type: 'url',
      group: 'credits',
      validation: (rule) =>
        rule.uri({scheme: ['http', 'https']}).error('Must be a valid URL'),
    }),
    defineField({
      name: 'relatedProjects',
      title: 'Related Projects',
      description: 'Shown as "next project" suggestions — falls back to same category if empty',
      type: 'array',
      group: 'credits',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'project'}],
        }),
      ],
      validation: (rule) => rule.max(3),
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
          description: 'Overrides the project title in search results and link previews',
          type: 'string',
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          description: 'Overrides the synopsis in search results and link previews',
          type: 'text',
          rows: 3,
        }),
        defineField({
          name: 'ogImage',
          title: 'Social Share Image',
          description: 'Overrides the cover image in link previews (1200x630 recommended)',
          type: 'image',
        }),
      ],
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
      media: 'cover.image',
    },
    prepare({title, year, client, media}) {
      return {
        title,
        subtitle: [year, client ?? 'Personal project'].filter(Boolean).join(' - '),
        media,
      }
    },
  },
})
