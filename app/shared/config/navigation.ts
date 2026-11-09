import { format } from '@/shared/i18n/format'

import { getComplianceLevel } from './complianceLevel'
import { SITE } from './site'

import type { Dictionary } from '@/shared/i18n'

/** Entrée de navigation : son libellé est lu dans le dictionnaire de la page (`nav`). */
export interface NavigationEntry {
  href: string
  key: keyof Dictionary['nav']
}

export interface NavigationItem {
  href: string
  label: string
  footerLabel?: string
}

/** Nœud de menu générique : le socle affiche des menus sans connaître le métier qui les fournit. */
export interface NavigationNode {
  id: string
  label: string
  href: string
  children: NavigationNode[]
}

export const MAIN_NAVIGATION: NavigationEntry[] = [
  { href: '/', key: 'home' },
  { href: '/blog', key: 'blog' },
  { href: '/taches', key: 'tasks' },
  { href: '/contact', key: 'contact' },
]

export const LEGAL_NAVIGATION: NavigationEntry[] = [
  { href: '/mentions-legales', key: 'legalNotice' },
  { href: '/donnees-personnelles', key: 'privacy' },
  { href: '/accessibilite', key: 'accessibility' },
  { href: '/plan-du-site', key: 'sitemap' },
]

export const ALL_NAVIGATION: NavigationEntry[] = [...MAIN_NAVIGATION, ...LEGAL_NAVIGATION]

/** Entrées libellées dans la langue de la page ; la déclaration d'accessibilité porte son état dans le footer. */
export const labelNavigation = (entries: NavigationEntry[], t: Dictionary): NavigationItem[] =>
  entries.map(({ href, key }) => ({
    href,
    label: t.nav[key],
    ...(key === 'accessibility' && {
      footerLabel: format(t.layout.accessibilityStatus, {
        status: t.compliance[getComplianceLevel(SITE.accessibility)],
      }),
    }),
  }))
