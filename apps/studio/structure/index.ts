import type {StructureResolver} from 'sanity/structure'
import {CogIcon, DocumentsIcon, TagIcon} from '@sanity/icons'

const SINGLETONS = ['siteSettings']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),

      S.divider(),

      S.listItem()
        .title('Portfolio')
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title('Portfolio')
            .items([
              S.documentTypeListItem('projectCategory').title('Categories').icon(TagIcon),
              S.documentTypeListItem('project').title('Projects').icon(DocumentsIcon),
            ]),
        ),

      S.divider(),

      ...S.documentTypeListItems().filter(
        (listItem) =>
          !SINGLETONS.includes(listItem.getId() as string) &&
          !['projectCategory', 'project'].includes(listItem.getId() as string),
      ),
    ])
