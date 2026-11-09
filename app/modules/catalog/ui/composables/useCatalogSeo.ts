import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'

import { format, useDictionary, useLocalizePath } from '@/shared/i18n'
import { usePageSeo } from '@/shared/seo'

import { PAGE_SIZE } from '@/modules/catalog/domain/catalog'
import { isRefined } from '@/modules/catalog/domain/catalogQuery'
import { CATALOG_ROOT, categoryTrail } from '@/modules/catalog/domain/categoryPath'

import type { Catalog } from '@/modules/catalog/domain/catalog'
import type { ComputedRef, Ref } from 'vue'

/** Titre et description saisis dans l'admin, chaînes vides si non saisis. */
export interface CatalogPageMeta {
  title: string
  description: string
}

export const useCatalogSeo = (
  path: ComputedRef<string>,
  title: ComputedRef<string>,
  categoryPath: ComputedRef<Catalog.CategoryPath | null>,
  query: ComputedRef<Catalog.Query>,
  page: Ref<Catalog.Page | undefined>,
  hrefForPage: (page: number) => string,
  rootMeta: () => CatalogPageMeta | undefined,
) => {
  const { siteUrl } = useRuntimeConfig().public
  const t = useDictionary()
  const localizePath = useLocalizePath()
  const withPage = (value: string) =>
    currentPage.value > 1
      ? format(t.catalog.pageTitle, { title: value, page: currentPage.value })
      : value
  const currentPage = computed(() => page.value?.page ?? 1)
  // Les métadonnées saisies ne visent que la racine du catalogue, pas ses catégories
  const meta = computed(() => (path.value === CATALOG_ROOT.href ? rootMeta() : undefined))

  usePageSeo({
    title: () => withPage(title.value),
    adminTitle: () => {
      const saisi = meta.value?.title ?? ''
      return saisi && withPage(saisi)
    },
    description: () =>
      meta.value?.description || format(t.catalog.description, { title: title.value }),
    canonicalPath: () =>
      currentPage.value > 1 ? `${path.value}?page=${currentPage.value}` : path.value,
    noindex: () => isRefined(query.value),
    breadcrumbTrail: () => (categoryPath.value ? categoryTrail(categoryPath.value) : null),
    pagination: () => ({
      ...(currentPage.value > 1 && { prev: hrefForPage(currentPage.value - 1) }),
      ...(page.value &&
        currentPage.value < page.value.pageCount && { next: hrefForPage(currentPage.value + 1) }),
    }),
    jsonLd: () => [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: title.value,
        itemListElement: (page.value?.items ?? []).map((product, index) => ({
          '@type': 'ListItem',
          position: (currentPage.value - 1) * PAGE_SIZE + index + 1,
          name: product.name,
          url: `${new URL(localizePath(path.value), siteUrl).href}#produit-${product.slug}`,
        })),
      },
    ],
  })
}
