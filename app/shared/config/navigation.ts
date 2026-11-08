import { getComplianceLevel } from './complianceLevel'
import { SITE } from './site'

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

export const MAIN_NAVIGATION: NavigationItem[] = [
  { href: '/', label: 'Accueil' },
  { href: '/blog', label: 'Blog' },
  { href: '/taches', label: 'Tâches' },
  { href: '/contact', label: 'Contact' },
]

export const LEGAL_NAVIGATION: NavigationItem[] = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/donnees-personnelles', label: 'Données personnelles' },
  {
    href: '/accessibilite',
    label: 'Déclaration d’accessibilité',
    footerLabel: `Accessibilité : ${getComplianceLevel(SITE.accessibility)}`,
  },
  { href: '/plan-du-site', label: 'Plan du site' },
]

export const ALL_NAVIGATION: NavigationItem[] = [...MAIN_NAVIGATION, ...LEGAL_NAVIGATION]
