import type { NavigationItem } from '@/shared/config'

export declare namespace Breadcrumb {
  interface Item {
    label: string
    href: string
  }
}

const HOME_PATH = '/'

/**
 * Fil d'Ariane d'une page, chemins sans préfixe de langue. Une piste fournie par un module (le
 * catalogue) prime : le socle ne connaît que la navigation statique, libellée dans la langue de la
 * page (accueil compris), et le libellé donné par la page.
 */
export const buildBreadcrumb = (
  path: string,
  navigation: NavigationItem[],
  currentLabel?: string,
  trail?: Breadcrumb.Item[] | null,
): Breadcrumb.Item[] => {
  if (path === HOME_PATH) return []
  const home = {
    label: navigation.find(({ href }) => href === HOME_PATH)?.label ?? '',
    href: HOME_PATH,
  }
  if (trail) return [home, ...trail]

  const item = navigation.find((navigation) => navigation.href === path)
  if (item) return [home, { label: item.label, href: item.href }]

  return currentLabel ? [home, { label: currentLabel, href: path }] : [home]
}

export const toBreadcrumbJsonLd = (items: Breadcrumb.Item[], siteUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.label,
    item: new URL(item.href, siteUrl).href,
  })),
})
