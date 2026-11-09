import { dictionaryFor } from '@/shared/i18n/dictionaries'

/** Page 503 autonome, dans la langue de l'adresse : aucune donnée, aucun script, styles en ligne. */
export const maintenancePage = (locale: string) => {
  const t = dictionaryFor(locale).maintenance
  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${t.title}</title>
<style>
body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: system-ui, sans-serif; background: #fff; color: #111; }
main { max-width: 560px; padding: 24px; }
h1 { font-size: 32px; margin: 0 0 16px; }
p { font-size: 16px; line-height: 1.6; }
</style>
</head>
<body>
<main>
<h1>${t.title}</h1>
<p>${t.text}</p>
</main>
</body>
</html>`
}
