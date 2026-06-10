import {defineQuery} from 'groq'

/**
 * All GROQ queries live here. TypeGen identifies query types by the
 * exported variable name across the whole codebase — duplicating a name
 * in two files makes its type silently overwrite. Keeping them in one
 * place avoids that footgun and makes the data layer easy to audit.
 */

/**
 * Image projection that resolves the asset and pulls its metadata —
 * `blurHash` and `lqip` (base64 placeholder) for blur-up loading, plus
 * `dimensions` for aspect-ratio sizing. `_ref` is kept for @sanity/image-url.
 */
const imageFields = /* groq */ `
  ...,
  alt,
  "ref": asset._ref,
  asset->{
    "hash": sha1hash,
    metadata {
      blurHash,
      lqip,
      dimensions,
    },
  }
`

const mediaFields = /* groq */ `
  ...,
  image {
    ${imageFields}
  },
  video {
    "ref": asset._ref
  }
`

export const siteSettingsQuery = defineQuery(
  `*[_type == "siteSettings"][0]`,
)

export const projectsQuery = defineQuery(
  `*[_type == "project"] | order(year desc) {
    _id,
    title,
    "slug": slug.current,
    thumbnail {
      ${imageFields}
    },
    year,
    client,
    "category": category->{_id, title, "slug": slug.current},
    description,
    projectUrl,
  }`,
)

export const projectQuery = defineQuery(
  `*[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    thumbnail {
      ${imageFields}
    },
    year,
    client,
    "category": category->{_id, title, "slug": slug.current},
    description,
    projectUrl,
  }`,
)

export const categoriesQuery = defineQuery(
  `*[_type == "projectCategory"] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    showcaseMedia {
      ${mediaFields}
    },
    order,
  }`,
)

export const categoryTitlesQuery = defineQuery(
  `*[_type == "projectCategory"] | order(order asc) {
    title,
    "slug": slug.current,
  }`,
)

export const projectsByCategoryQuery = defineQuery(
  `*[_type == "project" && category->slug.current == $category] | order(year desc) {
    _id,
    title,
    "slug": slug.current,
    thumbnail {
      ${imageFields}
    },
    year,
    client,
    "category": category->{_id, title, "slug": slug.current},
  }`,
)

export const categoryQuery = defineQuery(
  `*[_type == "projectCategory" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    showcaseMedia {
      ${mediaFields}
    },
    order,
    "projects": *[_type == "project" && category._ref == ^._id] | order(year desc) {
      _id,
      title,
      "slug": slug.current,
      thumbnail {
        ${imageFields}
      },
      year,
      client,
    },
  }`,
)


