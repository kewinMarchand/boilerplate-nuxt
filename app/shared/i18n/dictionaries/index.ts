import { en } from './en'
import { fr } from './fr'

import type {
  Dictionary,
  DictionarySection,
  MetaPage,
  MetaSection,
  PartialDictionary,
} from './dictionary'

const DICTIONARIES: Record<string, Dictionary> = { fr, en }

const META_PREFIX = 'meta.'

const isMetaSection = (section: DictionarySection): section is MetaSection =>
  section.startsWith(META_PREFIX)

/** Page dont une section `meta.<page>` porte les métadonnées. */
const metaPageOf = (section: MetaSection) =>
  // Le préfixe retiré, il reste la clé de `meta` que le type de la section garantit
  section.slice(META_PREFIX.length) as MetaPage

/**
 * Dictionnaire d'une langue, celui du français sans fichier de traduction. À n'appeler que côté
 * serveur (`import.meta.server`) : le navigateur ne reçoit que des sections (`dictionarySections`).
 */
export const dictionaryFor = (locale: string): Dictionary => DICTIONARIES[locale] ?? fr

/** Nom de section reçu de l'extérieur (requête du navigateur) : section connue, ou métadonnées d'une page connue. */
export const isDictionarySection = (value: string): value is DictionarySection => {
  const [section = '', page, ...rest] = value.split('.')
  if (rest.length) return false
  if (page === undefined) return section !== 'meta' && Object.hasOwn(fr, section)
  return section === 'meta' && Object.hasOwn(fr.meta, page)
}

/**
 * Sections d'un dictionnaire qui partent au navigateur : celles que lisent les composants rendus, jamais
 * le dictionnaire entier (maintenance, métadonnées des autres pages).
 */
export const dictionarySections = (
  dictionary: Dictionary,
  sections: readonly DictionarySection[],
): PartialDictionary =>
  sections.reduce<PartialDictionary>((picked, section) => {
    if (!isMetaSection(section)) return { ...picked, [section]: dictionary[section] }
    const page = metaPageOf(section)
    return { ...picked, meta: { ...picked.meta, [page]: dictionary.meta[page] } }
  }, {})
