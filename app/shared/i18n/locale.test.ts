import { en } from './dictionaries/en'
import { fr } from './dictionaries/fr'
import { format, plural } from './format'
import {
  alternatesByKey,
  languageLinks,
  languageName,
  localePrefix,
  localizePath,
  pathLocale,
  unlocalizePath,
} from './locale'

const keysOf = (value: object, prefix = ''): string[] =>
  Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'object' && child !== null
      ? keysOf(child, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )

const BILINGUAL = { locale: 'en', defaultLocale: 'fr', locales: ['fr', 'en'] }

describe('dictionnaires', () => {
  it('ont les mêmes clés en français et en anglais', () => {
    expect(keysOf(en).sort()).toEqual(keysOf(fr).sort())
  })

  it('ne contiennent que des données sérialisables', () => {
    expect(JSON.parse(JSON.stringify(en))).toEqual(en)
    expect(JSON.parse(JSON.stringify(fr))).toEqual(fr)
  })
})

describe('format et plural', () => {
  it('remplacent les valeurs nommées et choisissent la forme selon la langue', () => {
    expect(format('Retirer {name}', { name: 'Monstera' })).toBe('Retirer Monstera')
    expect(plural(fr.catalog.productCount, 0, 'fr-FR')).toBe('0 produit')
    expect(plural(fr.catalog.productCount, 2, 'fr-FR')).toBe('2 produits')
    expect(plural(en.catalog.productCount, 0, 'en-US')).toBe('0 products')
    expect(plural(en.catalog.productCount, 1, 'en-US')).toBe('1 product')
  })
})

describe('localizePath', () => {
  it('ne préfixe pas la langue par défaut, préfixe les autres', () => {
    expect(localizePath('/catalogue', 'fr', 'fr')).toBe('/catalogue')
    expect(localizePath('/catalogue?page=2', 'en', 'fr')).toBe('/en/catalogue?page=2')
    expect(localizePath('/', 'en', 'fr')).toBe('/en')
    expect(localizePath('/?a=1', 'en', 'fr')).toBe('/en?a=1')
  })

  it('laisse les ancres et les adresses externes', () => {
    expect(localizePath('#main', 'en', 'fr')).toBe('#main')
    expect(localizePath('https://exemple.fr/', 'en', 'fr')).toBe('https://exemple.fr/')
    expect(localizePath('//exemple.fr/', 'en', 'fr')).toBe('//exemple.fr/')
  })
})

describe('langue d’une adresse', () => {
  it('lit le préfixe qui a la forme d’une langue', () => {
    expect(localePrefix('/en/produit/x')).toBe('en')
    expect(localePrefix('/en')).toBe('en')
    expect(localePrefix('/blog')).toBeUndefined()
    expect(localePrefix('/')).toBeUndefined()
  })

  it('ne retient qu’un préfixe de langue activée autre que la langue par défaut', () => {
    expect(pathLocale('/en/contact', ['fr', 'en'])).toBe('en')
    expect(pathLocale('/contact', ['fr', 'en'])).toBe('fr')
    expect(pathLocale('/fr/contact', ['fr', 'en'])).toBe('fr')
    expect(pathLocale('/de/contact', ['fr', 'en'])).toBe('fr')
    expect(pathLocale('/en/contact', ['fr'])).toBe('fr')
    expect(pathLocale('/contact', ['en', 'fr'])).toBe('en')
  })

  it('retire le préfixe de la langue de la page', () => {
    expect(unlocalizePath('/en/catalogue/a', BILINGUAL)).toBe('/catalogue/a')
    expect(unlocalizePath('/en', BILINGUAL)).toBe('/')
    expect(unlocalizePath('/contact', { ...BILINGUAL, locale: 'fr' })).toBe('/contact')
  })
})

describe('languageLinks', () => {
  it('mène à l’équivalent de chaque langue, à son accueil sans équivalent', () => {
    expect(languageLinks(BILINGUAL, [{ locale: 'fr', path: '/produit/monstera' }])).toEqual([
      { locale: 'fr', href: '/produit/monstera' },
      { locale: 'en', href: '/en' },
    ])
  })
})

describe('alternatesByKey', () => {
  it('regroupe les chemins d’un même élément, dans l’ordre de la première langue', () => {
    expect(
      alternatesByKey([
        {
          locale: 'fr',
          entries: [
            { key: '1', path: '/produit/monstera' },
            { key: '2', path: '/produit/b' },
          ],
        },
        { locale: 'en', entries: [{ key: '1', path: '/produit/swiss' }] },
      ]),
    ).toEqual([
      [
        { locale: 'fr', path: '/produit/monstera' },
        { locale: 'en', path: '/produit/swiss' },
      ],
      [{ locale: 'fr', path: '/produit/b' }],
    ])
  })
})

describe('languageName', () => {
  it('nomme chaque langue dans sa propre langue', () => {
    expect(languageName('fr')).toBe('Français')
    expect(languageName('en')).toBe('English')
  })
})
