import type { Compliance } from './complianceLevel'

export interface SiteConfig {
  name: string
  description: string
  publisher: {
    companyName: string
    email: string
  }
  accessibility: Compliance.Audit
  /** Repli de l'identité du site quand l'API ne répond pas. */
  salesEnabled: boolean
}

export const SITE: SiteConfig = {
  name: 'Boilerplate Nuxt',
  description:
    'Boilerplate Nuxt 4 avec boilerplates-ui, TanStack Query, vee-validate et zod, outillé pour la QA, l’accessibilité et les tests end-to-end.',
  publisher: {
    companyName: 'Exemple SAS (société fictive)',
    email: 'contact@exemple.fr',
  },
  accessibility: { auditDate: null, complianceRate: null, auditor: null },
  salesEnabled: true,
}
