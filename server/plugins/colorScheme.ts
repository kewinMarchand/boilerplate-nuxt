import { COLOR_SCHEMES } from '@/shared/ui/color-scheme/colorSchemeBootScript'

// Thème servi par défaut (identité du site, posée dans le contexte au rendu), écrit dans le HTML servi seulement :
// déclaré dans `app.head.htmlAttrs`, il serait réappliqué à l'hydratation et effacerait le choix posé par le script
// d'amorçage (clair ou sombre mémorisé).
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const scheme = COLOR_SCHEMES.find((value) => value === event.context.defaultColorScheme)
    html.htmlAttrs.push(`data-color-scheme="${scheme ?? 'auto'}"`)
  })
})
