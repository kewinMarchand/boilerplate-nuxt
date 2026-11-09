import { en } from './en'
import { fr } from './fr'

import type { Dictionary } from './dictionary'

const DICTIONARIES: Record<string, Dictionary> = { fr, en }

/**
 * Dictionnaire d'une langue, celui du français sans fichier de traduction. À n'appeler que côté
 * serveur (`import.meta.server`) : le navigateur reçoit celui de la page dans le payload.
 */
export const dictionaryFor = (locale: string): Dictionary => DICTIONARIES[locale] ?? fr
