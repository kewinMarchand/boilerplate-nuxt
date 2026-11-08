export declare namespace PageMeta {
  type Key =
    | 'home'
    | 'catalog'
    | 'blog'
    | 'contact'
    | 'sitemap'
    | 'legal-notice'
    | 'privacy'
    | 'accessibility'

  /** Chaînes vides si non saisies : la page garde son titre et sa description. */
  interface Entity {
    title: string
    description: string
  }

  type ByPage = Record<Key, Entity>
}

const EMPTY: PageMeta.Entity = { title: '', description: '' }

export const EMPTY_PAGE_METAS: PageMeta.ByPage = {
  home: EMPTY,
  catalog: EMPTY,
  blog: EMPTY,
  contact: EMPTY,
  sitemap: EMPTY,
  'legal-notice': EMPTY,
  privacy: EMPTY,
  accessibility: EMPTY,
}
