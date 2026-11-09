import { computed } from 'vue'
import { useRoute } from '#imports'

import { samePathInEveryLocale } from '@/shared/i18n'
import { usePagePath, useRouteName } from '@/shared/i18n/route'

import { CATALOG_ROOT, useCatalogNavigation, useProductAlternates } from '@/modules/catalog'

import type { LanguageAlternate, LocaleContext } from '@/shared/i18n'
import type { ComputedRef } from 'vue'

import { useArticleAlternates } from '@/modules/blog/index.alternates'

/**
 * La page courante dans chaque langue du site, pour le sélecteur et les `hreflang` : fiches produit,
 * articles et catégories par leurs `alternates`, le même chemin partout pour les pages fixes. Rien à
 * lire sur un site monolingue. À attendre dans le `setup` de `app.vue` : l'en-tête est rendu avant
 * la page, il ne peut pas attendre une donnée posée par elle.
 */
export const useLanguageAlternates = async (
  locale: LocaleContext,
): Promise<ComputedRef<LanguageAlternate[]>> => {
  if (locale.locales.length < 2) return computed(() => [])
  const route = useRoute()
  const routeName = useRouteName()
  const pagePath = usePagePath()
  const slugOf = (name: string) => () =>
    routeName.value === name ? String(route.params['slug']) : undefined
  const [product, article, { alternatesFor }] = await Promise.all([
    useProductAlternates(slugOf('produit-slug')),
    useArticleAlternates(slugOf('blog-slug')),
    useCatalogNavigation(),
  ])
  return computed(() => {
    if (routeName.value === 'produit-slug') return product.value
    if (routeName.value === 'blog-slug') return article.value
    if (routeName.value === 'catalogue-slug' && pagePath.value !== CATALOG_ROOT.href) {
      return alternatesFor(pagePath.value)
    }
    return samePathInEveryLocale(locale, pagePath.value)
  })
}
