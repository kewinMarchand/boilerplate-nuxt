import { existsSync, readdirSync } from 'node:fs'
import boundaries from '@boundaries/eslint-plugin'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

import withNuxt from './.nuxt/eslint.config.mjs'

const MODULES_ROOT = 'app/modules'
const LAYERS = ['domain', 'application', 'infrastructure', 'ui']

const MODULES_WITHOUT_APPLICATION = readdirSync(MODULES_ROOT).filter(
  (module) => !existsSync(`${MODULES_ROOT}/${module}/application`),
)

const RELATIVE_DEPTH = { group: ['../../*'], message: 'Utiliser l’alias @/ au-delà d’un niveau.' }
const ICONS_WRAPPER = {
  group: ['@iconify-json/*', 'svgstore'],
  message:
    'Les icônes passent par le sprite : nom dans icons.json, make icons, puis @/shared/ui/kit/Icon.',
}
const CAROUSEL_WRAPPER = {
  group: ['embla-carousel', 'embla-carousel-*'],
  message: 'Embla passe par le wrapper @/shared/ui/carousel.',
}
const OBSERVABILITY_WRAPPER = {
  group: ['@sentry/*'],
  message: 'Le SDK GlitchTip passe par le wrapper @/shared/observability.',
}
const API_CLIENT_WRAPPER = {
  group: ['openapi-fetch'],
  message: 'L’API passe par le client typé @/shared/api/client.',
}
const CSP_WRAPPER = {
  group: ['@kewinmarchand/csp'],
  message: 'La CSP passe par le wrapper @/shared/security.',
}
const FRAMEWORK_PACKAGES = [
  'vue',
  'vue-router',
  'nuxt',
  'nuxt/*',
  '\\#app',
  '\\#imports',
  '\\#components',
  '@tanstack/*',
  '@kewinmarchand/boilerplates-ui',
  '@kewinmarchand/boilerplates-ui/*',
  'vee-validate',
]
const FRAMEWORKS_IN_DOMAIN = {
  group: FRAMEWORK_PACKAGES,
  message: 'Le domaine ne dépend d’aucun framework : données immuables et fonctions pures.',
}
const FRAMEWORKS_IN_APPLICATION = {
  group: FRAMEWORK_PACKAGES,
  message:
    'L’application ne dépend d’aucun framework : elle renvoie une union que la couche de routage traduit.',
}

const sameModule = (type) => ({
  element: { type, captured: { module: '{{ from.element.captured.module }}' } },
})

const policy = (from, to, message, extra = {}) => ({
  from: { element: { type: from } },
  allow: { to: typeof to === 'string' ? { element: { type: to } } : to, ...extra },
  message,
})

const ARCHITECTURE_POLICIES = [
  policy('routes', 'views', 'Routage : vues, index public des modules et socle seulement.'),
  policy('routes', 'module', 'Routage : vues, index public des modules et socle seulement.'),
  policy('routes', 'shared', 'Routage : vues, index public des modules et socle seulement.'),
  policy('views', 'module', 'Vue : index public des modules et socle seulement.'),
  policy('views', 'shared', 'Vue : index public des modules et socle seulement.'),
  policy(
    'views',
    { element: { type: 'views', captured: { view: '{{ from.element.captured.view }}' } } },
    'Vue : index public des modules et socle seulement.',
  ),
  ...LAYERS.map((layer) =>
    policy('module', sameModule(layer), 'Index public : seulement les couches de son module.'),
  ),
  policy('domain', sameModule('domain'), 'Domaine : seulement le domaine de son module.'),
  policy('domain', 'shared', 'Domaine : seulement les types du socle.', {
    dependency: { kind: 'type' },
  }),
  policy('application', sameModule('domain'), 'Application : domaine et infrastructure du module.'),
  policy(
    'application',
    sameModule('infrastructure'),
    'Application : domaine et infrastructure du module.',
  ),
  policy('application', 'shared', 'Application : seulement les types du socle.', {
    dependency: { kind: 'type' },
  }),
  policy(
    'infrastructure',
    sameModule('domain'),
    'Infrastructure : domaine du module et client HTTP.',
  ),
  policy(
    'infrastructure',
    sameModule('infrastructure'),
    'Infrastructure : domaine du module et client HTTP.',
  ),
  policy('infrastructure', 'shared-api', 'Infrastructure : domaine du module et client HTTP.'),
  policy('ui', sameModule('domain'), 'Interface : domaine, application et interface du module.'),
  policy(
    'ui',
    sameModule('application'),
    'Interface : domaine, application et interface du module.',
  ),
  policy('ui', sameModule('ui'), 'Interface : domaine, application et interface du module.'),
  policy('ui', 'shared', 'Interface : domaine, application et interface du module.'),
  ...MODULES_WITHOUT_APPLICATION.map((module) => ({
    from: { element: { type: 'ui', captured: { module } } },
    allow: { to: sameModule('infrastructure') },
  })),
  policy('shared', 'shared', 'Socle : n’importe ni module, ni vue, ni routage.'),
  policy(
    'shared-api',
    { element: { type: 'shared', captured: { area: 'i18n' } } },
    'Client HTTP : seulement la langue de la page, dans le socle.',
  ),
]

export default withNuxt(
  {
    ignores: [
      '.output/**',
      'playwright-report/**',
      'test-results/**',
      '.lighthouseci/**',
      'app/shared/api/schema.d.ts',
    ],
  },
  {
    settings: { 'import-x/internal-regex': '^[@~]/' },
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'import/order': 'off',
      'simple-import-sort/imports': [
        'error',
        {
          // Ordre de standards-front : 1 tiers (framework et alias de Nuxt `#…` compris), 2 bibliothèque commune,
          // 3 socle, 4 modules (index public, puis couches domain, application, infrastructure, ui), 5 vues,
          // 6 relatifs, 7 types, 8 effets de bord (styles) en dernier, leur ordre ayant un effet. Le motif de
          // l'index d'un module exclut \u0000, que le plugin ajoute aux imports de type.
          groups: [
            ['^node:', '^(?!@kewinmarchand/)@?\\w', '^#'],
            ['^@kewinmarchand/'],
            ['^@/shared/'],
            [
              '^@/modules/[^/\\u0000]+(/index)?$',
              '^@/modules/[^/]+/domain/',
              '^@/modules/[^/]+/application/',
              '^@/modules/[^/]+/infrastructure/',
              '^@/modules/[^/]+/ui/',
            ],
            ['^@/views/'],
            ['^\\.'],
            ['^.+\\u0000$'],
            ['^\\u0000'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            RELATIVE_DEPTH,
            ICONS_WRAPPER,
            CAROUSEL_WRAPPER,
            OBSERVABILITY_WRAPPER,
            API_CLIENT_WRAPPER,
            CSP_WRAPPER,
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
      '@typescript-eslint/consistent-type-imports': 'error',
      'vue/require-default-prop': 'off',
      'vue/html-self-closing': 'off',
    },
  },
  {
    files: ['app/**/*.ts', 'app/**/*.vue', 'server/**/*.ts'],
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['.nuxt/tsconfig.app.json', '.nuxt/tsconfig.server.json'],
          noWarnOnMultipleProjects: true,
        },
      },
      'boundaries/elements': [
        ...LAYERS.map((layer) => ({
          type: layer,
          pattern: `${MODULES_ROOT}/*/${layer}`,
          capture: ['module'],
          partialMatch: false,
          exclusive: true,
        })),
        { type: 'module', pattern: `${MODULES_ROOT}/*`, capture: ['module'], partialMatch: false },
        { type: 'shared-api', pattern: 'app/shared/api', partialMatch: false, exclusive: true },
        { type: 'shared', pattern: 'app/shared/*', capture: ['area'], partialMatch: false },
        { type: 'views', pattern: 'app/views/*', capture: ['view'], partialMatch: false },
        { type: 'routes', pattern: 'app/pages', partialMatch: false },
        { type: 'routes', pattern: 'server', partialMatch: false },
        { type: 'routes', pattern: 'app', partialMatch: false },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          checkInternals: false,
          message:
            'Architecture : la couche « {{ from.element.type }} » ne peut pas importer « {{ to.element.type }} ».',
          policies: ARCHITECTURE_POLICIES,
        },
      ],
    },
  },
  {
    files: ['app/modules/*/domain/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            RELATIVE_DEPTH,
            ICONS_WRAPPER,
            CAROUSEL_WRAPPER,
            OBSERVABILITY_WRAPPER,
            API_CLIENT_WRAPPER,
            CSP_WRAPPER,
            FRAMEWORKS_IN_DOMAIN,
          ],
        },
      ],
    },
  },
  {
    files: ['app/modules/*/application/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            RELATIVE_DEPTH,
            ICONS_WRAPPER,
            CAROUSEL_WRAPPER,
            OBSERVABILITY_WRAPPER,
            API_CLIENT_WRAPPER,
            CSP_WRAPPER,
            FRAMEWORKS_IN_APPLICATION,
          ],
        },
      ],
    },
  },
  {
    files: ['tools/**'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['app/shared/ui/kit/Icon.vue'],
    rules: { 'vue/multi-word-component-names': 'off' },
  },
  {
    // HTML des pages légales : l'API échappe le HTML saisi dans l'admin et retire les liens dangereux
    files: ['app/modules/content/ui/LegalPageContent.vue'],
    rules: { 'vue/no-v-html': 'off' },
  },
  {
    files: ['tools/icons.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [RELATIVE_DEPTH, API_CLIENT_WRAPPER] }],
    },
  },
  {
    files: ['app/shared/ui/carousel/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [RELATIVE_DEPTH, ICONS_WRAPPER, OBSERVABILITY_WRAPPER, API_CLIENT_WRAPPER] },
      ],
    },
  },
  {
    files: ['app/shared/observability/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [RELATIVE_DEPTH, ICONS_WRAPPER, CAROUSEL_WRAPPER, API_CLIENT_WRAPPER] },
      ],
    },
  },
  {
    files: ['app/shared/security/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            RELATIVE_DEPTH,
            ICONS_WRAPPER,
            CAROUSEL_WRAPPER,
            OBSERVABILITY_WRAPPER,
            API_CLIENT_WRAPPER,
          ],
        },
      ],
    },
  },
  {
    files: ['app/shared/api/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [RELATIVE_DEPTH, ICONS_WRAPPER, CAROUSEL_WRAPPER, OBSERVABILITY_WRAPPER] },
      ],
    },
  },
)
