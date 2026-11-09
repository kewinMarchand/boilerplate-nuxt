import type { fr } from './fr'

/** Libellés de l'interface : la forme du dictionnaire français, que chaque langue reprend clé pour clé. */
export type Dictionary = typeof fr

export type MetaPage = keyof Dictionary['meta']
export type MetaSection = `meta.${MetaPage}`

/** Partie du dictionnaire envoyée au navigateur : une section, ou les métadonnées d'une seule page. */
export type DictionarySection = Exclude<keyof Dictionary, 'meta'> | MetaSection

/** Sections reçues par le navigateur, celles du document et celles de la page. */
export type PartialDictionary = Partial<Omit<Dictionary, 'meta'>> & {
  meta?: Partial<Dictionary['meta']>
}
