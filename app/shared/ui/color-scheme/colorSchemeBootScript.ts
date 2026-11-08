export const COLOR_SCHEME_STORAGE_KEY = 'color-scheme'
export const COLOR_SCHEMES = ['auto', 'light', 'dark'] as const

export type ColorScheme = (typeof COLOR_SCHEMES)[number]

// Exécuté avant le rendu, dans le même script que le mode renforcé : le HTML servi porte le thème par défaut du site, le
// choix mémorisé (« système » compris) le remplace sans flash. Clé absente : le défaut du site reste.
export const COLOR_SCHEME_BOOT_SCRIPT = `try{var c=localStorage.getItem('${COLOR_SCHEME_STORAGE_KEY}');if(c==='auto'||c==='light'||c==='dark')document.documentElement.dataset.colorScheme=c}catch(e){console.warn(e)}`
