import type {StructureResolver} from 'sanity/structure'
import {DocumentsIcon, TagIcon, UserIcon} from '@sanity/icons'

const SINGLETONS = ['about']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('About')
        .icon(UserIcon)
        .child(S.document().schemaType('about').documentId('about')),

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
