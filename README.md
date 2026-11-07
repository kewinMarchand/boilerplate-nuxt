# boilerplate-nuxt

Point de départ pour une application **Nuxt 4** en rendu serveur avec les composants de **boilerplates-ui**, **TanStack Query**, **vee-validate + zod**, et toute la chaîne qualité : lint, format, types, tests unitaires, end-to-end, accessibilité et Lighthouse.

Les pages de démonstration montrent chaque brique en situation :

| Page                | Ce qu'elle montre                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| `/`                 | Hero pleine largeur, carrousel Embla accessible, articles chargés côté serveur avec TanStack Query          |
| `/taches`           | Chargement côté client avec TanStack Query et ses trois états : chargement, erreur avec relance, liste vide |
| `/contact`          | Formulaire validé par un schéma zod, erreurs liées aux champs, envoi par mutation TanStack Query            |
| `/catalogue/...`    | Liste à facettes : filtres, tri, pagination et vue dans l'URL, rendu serveur, fonctionne sans JavaScript    |
| Pages légales       | Mentions légales, données personnelles, déclaration d'accessibilité lues dans l'API, plan du site           |
| `/charte-graphique` | Charte graphique vivante (tokens, composants, icônes), en développement uniquement                          |

## Stack

| Brique                                    | Rôle                                                             |
| ----------------------------------------- | ---------------------------------------------------------------- |
| Nuxt 4 (SSR), Vue 3                       | Routage, rendu serveur, SEO, routes serveur                      |
| TypeScript 6 (strict), vue-tsc            | Typage                                                           |
| boilerplates-ui                           | Jetons, CSS et composants Vue communs ; styles du site scoped    |
| TanStack Vue Query 5                      | Cache et synchronisation des données, compatible SSR             |
| vee-validate + zod 4                      | Formulaires, validation et types dérivés du même schéma          |
| Embla Carousel 8                          | Carrousel (glisser, swipe, molette), via `shared/ui/`            |
| Lucide (sprite SVG)                       | Icônes : `icons.json`, `make icons`, composant `Icon`            |
| @nuxt/fonts                               | Police Inter servie localement                                   |
| ESLint 10 (@nuxt/eslint), Prettier, Husky | Qualité du code, vérifiée à chaque commit                        |
| Vitest 5 + Testing Library                | Tests unitaires et fonctionnels                                  |
| Playwright + axe-core                     | Tests end-to-end et accessibilité, desktop et mobile             |
| @sentry/nuxt                              | Suivi des erreurs GlitchTip, activé par variable d'environnement |
| Lighthouse CI                             | Performance, accessibilité, SEO, bonnes pratiques                |

## Prérequis

- Docker avec Compose
- `make`
- git

Rien d'autre : ni Node, ni Yarn, ni navigateur sur la machine. Chaque commande `make` lance `docker compose run` sur le service `node` (image officielle Playwright, à la version exacte de `@playwright/test`). Les dépendances vivent dans le volume nommé `node_modules`, et le conteneur tourne avec l'UID et le GID de la machine : les fichiers générés ne sont pas à root.

## Démarrage

```sh
git clone https://github.com/kewinMarchand/boilerplate-nuxt.git
cd boilerplate-nuxt
cp .env.example .env
make install   # image de dev (Node, Chromium) et dépendances
make up        # http://localhost:3010, rechargement à chaud
```

Le port vient de `DEV_PORT` (3010 par défaut), pour `make up` comme pour `make start`. Le conteneur partage le réseau de la machine. Le navigateur appelle l'API directement : un autre port doit être autorisé par la configuration CORS de l'API.

Variables d'environnement (`.env`) :

| Variable                            | Rôle                                                                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `NUXT_PUBLIC_SITE_URL`              | URL publique, utilisée pour les URL canoniques, Open Graph, le sitemap et le JSON-LD                                                 |
| `API_URL`                           | Origine de l'API : `http://localhost:8090` (API Platform, défaut) ou `http://localhost:8091` (Hono), même contrat. Lue à l'exécution |
| `NUXT_API_URL`                      | Origine de l'API pour le serveur seul, quand il ne joint pas celle du navigateur (conteneur). Vide : `API_URL`                       |
| `API_SCHEMA_URL`                    | Schéma OpenAPI de l'API consommée, lu par `make api-types`                                                                           |
| `MAINTENANCE`                       | `1` pour servir la page de maintenance (503) sur toutes les routes                                                                   |
| `NUXT_GLITCHTIP_DSN`                | DSN GlitchTip du serveur. Vide : aucun SDK chargé, aucune requête                                                                    |
| `NUXT_PUBLIC_GLITCHTIP_DSN`         | DSN GlitchTip du navigateur, SDK chargé après l'affichage. Vide : rien                                                               |
| `NUXT_PUBLIC_GLITCHTIP_ENVIRONMENT` | Environnement des erreurs (défaut : `development` en dev, `production` sinon)                                                        |
| `NUXT_PUBLIC_MATOMO_URL`            | URL de l'instance Matomo, mesure d'audience sans cookie. Vide : aucun script, aucune requête                                         |
| `NUXT_PUBLIC_MATOMO_SITE_ID`        | Identifiant du site dans Matomo                                                                                                      |
| `NUXT_PUBLIC_DEV_TOOLS`             | `true` pour ouvrir la charte graphique et la route de test de la 500 hors dev                                                        |

## Commandes

`make help` liste toutes les commandes. Les principales :

| Commande                               | Effet                                                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `make install`                         | Construit l'image de développement et installe les dépendances                                               |
| `make up`                              | Serveur de développement (port `DEV_PORT`, 3010 par défaut)                                                  |
| `make build` / `make start`            | Build de production, puis le servir                                                                          |
| `make qa`                              | QA rapide : lint (dont architecture), auto-test des règles, sprite d'icônes, format, types, tests unitaires  |
| `make arch-selftest`                   | Écrit des imports interdits, exige l'échec d'ESLint, puis les retire                                         |
| `make qa-full`                         | QA complète : QA rapide, e2e, accessibilité, Lighthouse                                                      |
| `make test-unit`                       | Vitest                                                                                                       |
| `make test-e2e`                        | Playwright, desktop et mobile                                                                                |
| `make test-a11y`                       | axe-core, WCAG 2.1 AA, sur chaque page, en mode normal et renforcé                                           |
| `make metrics`                         | Lighthouse CI en clair puis en sombre : échoue sous 90 en performance ou sous 100 en accessibilité et SEO    |
| `make icons` / `make icons-check`      | Génère le sprite `public/icons.svg` et le type `IconName` depuis `icons.json`, ou vérifie qu'ils sont à jour |
| `make api-types`                       | Génère `app/shared/api/schema.d.ts` depuis `API_SCHEMA_URL`                                                  |
| `make docker-build` / `make docker-up` | Image de production, sur le port `PORT` (3010 par défaut)                                                    |
| `make docker-down`                     | Arrête les conteneurs, dont ceux du profil de développement                                                  |

## Architecture

```
app/
  pages/        routage : chaque page délègue à une vue de views/ ou d'un module
  app.vue       layout racine (routage)
  error.vue     pages 404 et 500 (routage), affichage dans views/errors/
  views/        pages sans métier ou qui composent des modules
    home/        accueil : hero, carrousel, articles du blog
    legal/       mentions, données personnelles, déclaration d'accessibilité, plan du site
    errors/      contenu des pages 404 et 500
    styleguide/  charte graphique (développement uniquement)
  modules/      un dossier par sous-domaine métier
    catalog/
      domain/            types (namespace Catalog), état de recherche dans l'URL, chemin de catégories, prix
      application/       cas d'utilisation sans framework : ouvrir une catégorie, charger une page
      infrastructure/    dépôt (client typé de l'API) et traduction dans http/ (couche anti-corruption)
      ui/                composants, composables, vue rendue par la page
      index.ts           seul export public du module
    blog/, contact/, content/, task/   même découpage, sans application/
  shared/       socle sans métier : config, thème, providers, SEO, formulaires,
                kit d'interface, layout, carrousel, mode renforcé
server/         robots.txt, sitemap.xml, maintenance, compression du HTML (routage)
tests/
  e2e/          un fichier par page ou par brique transverse
  a11y/         audit axe de chaque page, dans les deux modes
  support/      routes testées, ports, actions partagées
tools/          archSelftest.ts (auto-test des règles d'architecture)
```

Le sens des dépendances est routage vers `views/`, puis vers l'index public des modules, puis vers `shared/`, jamais l'inverse. Un module n'importe jamais un autre module : la composition se fait dans `views/`. À l'intérieur d'un module, `domain/` ne dépend que de lui-même et d'aucun framework. Ces règles sont vérifiées par ESLint (`@boundaries/eslint-plugin`), et `make arch-selftest` prouve qu'elles échouent sur des imports interdits.

Les conventions de code viennent du `CLAUDE.md` global de l'auteur. Le `CLAUDE.md` de ce dépôt note les choix propres au projet, les versions épinglées et les pièges connus.

## Recettes

### Ajouter une page

1. Créer la vue `app/views/<nom>/<Nom>View.vue` et son `index.ts` (ou, si la page porte un métier propre, un module `app/modules/<nom>/` avec ses couches).
2. Créer `app/pages/<route>.vue`, qui appelle `usePageSeo` et rend la vue.
3. Ajouter la route à `app/shared/config/navigation.ts` (menu, plan du site, sitemap et fil d'Ariane) et à `tests/support/routes.ts` (tests de réponse, de SEO, d'accessibilité et de débordement).
4. Écrire `tests/e2e/<route>.e2e.ts` et ajouter l'URL à `.lighthouserc.json`.

### Charger des données avec TanStack Query

Le pattern est dans `app/modules/task/` :

- `infrastructure/taskRepository.ts` appelle l'API par le client typé et `infrastructure/http/taskTranslation.ts` traduit la réponse vers le domaine. L'interface ne connaît pas le contrat.
- `ui/composables/useTasks.ts` encapsule `useQuery`, avec une clé de cache exportée et une erreur métier (`TasksLoadError`).
- `ui/TaskList.vue` affiche les trois états à partir de props, ce qui le rend testable sans réseau.
- `ui/TasksPanel.vue` relie le composable au composant d'affichage.

Pour un contenu à indexer, ajouter `onServerPrefetch(() => query.suspense())` dans le composable (voir `useLatestArticles` et `useCatalog`) : la requête est faite au rendu serveur et réhydratée au démarrage.

### Ajouter un champ de formulaire

1. Ajouter le champ et son message d'erreur dans `app/modules/contact/domain/contactSchema.ts`. Le type du formulaire en découle.
2. Ajouter `defineField('champ', FIELD_CONFIG)` dans `useContactForm.ts`, puis le `TextField` de la bibliothèque dans `ContactForm.vue` avec un `id`, `v-model` et `v-bind`. Le composant relie le message au champ par `aria-describedby`.

### CSP et rapports de violation

Chaque réponse porte un en-tête `Content-Security-Policy-Report-Only` construit par [`@kewinmarchand/csp`](https://github.com/kewinMarchand/csp), dans `app/shared/security/` : rien n'est bloqué, le navigateur signale chaque ressource qu'une CSP stricte refuserait à `POST /api/csp-report`, qui écrit une ligne lisible sur la sortie standard du serveur :

```
[csp-report] https://cdn.exemple.com a besoin d'une autorisation de type script (script-src) — bloqué sur /contact
```

- **Lire les logs** : `docker compose logs -f web` pour l'image de production, la sortie de `make up` en développement, la console de l'hébergeur en production. Au démarrage, `[boilerplate-nuxt] serveur démarré (production)` permet de retrouver le bon fichier.
- **Autoriser une origine** : l'ajouter à sa directive (le nom est entre parenthèses dans la ligne) dans `siteCsp()` de `app/shared/security/csp.ts`. L'API (`NUXT_PUBLIC_API_URL`), Matomo et GlitchTip y sont déjà, quand leur variable est renseignée. L'en-tête est calculé à l'exécution, comme le reste de `runtimeConfig`.
- **Pourquoi Report-Only et `'unsafe-inline'`** : on collecte d'abord ce que le site charge vraiment avant de bloquer quoi que ce soit ; l'hydratation de Nuxt et les attributs `style` écrivent du code en ligne, et un nonce par réponse rendrait toutes les pages dynamiques.

### Ajouter une icône

Ajouter son nom Lucide dans `icons.json`, puis lancer `make icons` : le sprite `public/icons.svg` et le type `IconName` sont régénérés, à versionner tous les deux. `make qa` échoue s'ils sont périmés. Les outils d'icônes (`@iconify-json/lucide`, `svgstore`) ne s'importent que dans `tools/icons.ts`, ESLint le refuse ailleurs.

### Ajouter une catégorie au catalogue

L'arbre vient de l'API (`GET /api/categories`) : une catégorie s'ajoute côté API. Menu, fil d'Ariane, plan du site et sitemap en découlent, par le value object `CategoryPath` du domaine.

## Tests

- **Unitaires et fonctionnels** : fichiers `*.test.ts` à côté du code testé.
- **End-to-end** : Playwright sert le build de production sur le port 3110 (outils de dev activés) et 3111 (production stricte, pour vérifier les 404 de la charte et de la route de test). Les éléments sont ciblés par `data-testid`, préfixé par le domaine (`tasks-list`, `catalog-sort`). Chaque rendu conditionnel est testé présent et absent. Les tests attendent la fin de l'hydratation (`html[data-hydrated]`).
- **Accessibilité** : `tests/a11y/` passe axe-core sur chaque route, les pages d'erreur et le menu ouvert, en mode normal et renforcé. Axe ne couvre qu'une partie du RGAA, un audit manuel reste nécessaire.
- **Captures** : `tests/e2e/captures.e2e.ts` enregistre l'accueil et le catalogue à 375, 768 et 1280 px dans les deux modes, dans `test-results/`.

## Intégration continue

`.github/workflows/ci.yml` lance `make install`, `make qa`, puis, contre l'API Hono clonée et lancée dans le job (`API_URL=http://localhost:8091`), les tests e2e, accessibilité et Lighthouse, à chaque push sur `main` et sur chaque pull request. En cas d'échec, le rapport Playwright est joint au run.

## Démarrer un projet à partir de ce dépôt

### Créer le dépôt

Le dépôt est un template GitHub. Voie recommandée : le bouton « Use this template », ou en ligne de commande :

```sh
gh repo create mon-projet --template kewinMarchand/boilerplate-nuxt --private --clone
cd mon-projet
```

Le nouveau dépôt part d'un historique neuf, sans lien avec celui-ci.

Pour suivre les évolutions du boilerplate ou y contribuer, passer plutôt par un fork. `gh repo fork` le clone, le déclare en `origin` et ajoute ce dépôt en `upstream`. Un fork d'un dépôt public reste public.

```sh
gh repo fork kewinMarchand/boilerplate-nuxt --clone --fork-name mon-projet
```

Ensuite, suivre [Démarrage](#démarrage).

### Récupérer les mises à jour

Avec un fork, l'historique est commun, une fusion suffit :

```sh
git fetch upstream
git merge upstream/main
```

Depuis un template, l'historique n'est pas commun. Une fusion rejouerait tout le dépôt. Il faut prendre les commits utiles un par un :

```sh
git remote add boilerplate https://github.com/kewinMarchand/boilerplate-nuxt.git
git fetch boilerplate
git log --oneline boilerplate/main   # repérer les commits à reprendre
git cherry-pick <sha>
```

### Personnaliser

| Quoi                             | Fichiers                                                                                                                                                                                                   |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nom du paquet et titre           | `package.json` (`name`), titre de ce README et du `CLAUDE.md`, titulaire dans `LICENSE`                                                                                                                    |
| Identité du site                 | `app/shared/config/site.ts` : nom, description, langue, éditeur (SEO), résultat d'audit d'accessibilité (lien du footer). Les valeurs fournies sont fictives                                               |
| Nom affiché dans les tests       | `tests/e2e/home.e2e.ts` (h1 du hero) et `tests/e2e/layout.e2e.ts` (nom accessible du logo), à aligner sur `SITE.name`                                                                                      |
| Couleur principale               | jetons de `@kewinmarchand/boilerplates-ui` (`tokens.json`), lus par `app/shared/theme/tokens.ts` (`PRIMARY_COLOR`), repris par la balise `theme-color`. Reporter la valeur dans `theme_color` du manifeste |
| Manifeste                        | `public/manifest.webmanifest` : `name`, `short_name`, `theme_color`                                                                                                                                        |
| URL publique                     | `NUXT_PUBLIC_SITE_URL` dans `.env.example`, `compose.yaml` et la valeur par défaut de `nuxt.config.ts`                                                                                                     |
| Port de développement (3010)     | script `dev` de `package.json`, `.env.example`, `compose.yaml`, `nuxt.config.ts`, aides de `make up` et `make docker-up` dans le `Makefile`                                                                |
| Ports de test (3110, 3111, 3210) | `tests/support/ports.ts` pour Playwright, `.lighthouserc.json` pour Lighthouse. À changer seulement s'ils entrent en conflit avec un autre projet                                                          |
| Logo                             | `public/images/logo-mark.svg`, affiché par le header, le footer et la charte graphique                                                                                                                     |
| Favicons et partage              | `public/favicon.ico`, `public/favicon.svg`, `public/apple-touch-icon.png`, `public/icon-192.png`, `public/icon-512.png`, `public/og-image.jpg`                                                             |
| Accueil                          | `app/views/home/` : hero (`HomeHero.vue`), images `public/images/hero-*` et `slide-*`. Les diapositives du carrousel viennent de l'API (`GET /api/slides`), administrées dans son `/admin`                 |
| Pages légales                    | Texte lu dans l'API (`GET /api/legal_pages/{slug}`), à modifier dans son `/admin` (Pages légales). Restent dans `app/views/legal/` la section « Mesure d'audience » et le bouton d'opposition              |
| URL Lighthouse                   | `ci.url` de `.lighthouserc.json`, une entrée par route à mesurer                                                                                                                                           |
| Intégration continue             | `.github/workflows/ci.yml` : branche surveillée (`main`), puis `make qa`, `make test-e2e test-a11y` et `make metrics`                                                                                      |

### Retirer les modules d'exemple

Le catalogue, le blog et les tâches servent de démonstration. Le module `contact` reste, il sert de modèle et porte les règles d'architecture. Le catalogue est le plus câblé, puisqu'il fournit le menu de catégories du header, le fil d'Ariane des catégories, le plan du site et le sitemap.

1. **Supprimer**
   - les modules `app/modules/catalog/`, `app/modules/blog/` et `app/modules/task/`
   - les pages `app/pages/taches.vue` et `app/pages/catalogue/`
   - le menu de catégories du socle : `app/shared/ui/layout/CategoryMenu.vue` et le dossier `app/shared/ui/layout/composables/` (`useCategoryMenu.ts`, `useMenuDrillDown.ts`)
   - les tests `tests/e2e/catalogue.e2e.ts`, `tests/e2e/taches.e2e.ts` et `tests/e2e/category-menu.e2e.ts`
2. **Débrancher le routage**
   - `app/app.vue` : retirer l'import du catalogue et rendre `<AppShell>` sans `category-menu` ni `breadcrumb-trail`
   - `app/error.vue` : retirer `getCategoryMenu` et la mention du catalogue dans la description
   - `server/routes/sitemap.xml.ts` (route Nitro) : ne garder que `MAIN_NAVIGATION` et `LEGAL_NAVIGATION`
3. **Simplifier le layout**
   - `AppShell.vue` et `AppHeader.vue` : retirer la prop `categoryMenu` et l'entrée `CategoryMenu` de la navigation
   - `MobileMenu.vue` : retirer la prop `menu`, le sous-menu par niveaux et le bouton du catalogue. Le panneau garde le titre « Menu » et `MAIN_NAVIGATION`
4. **Nettoyer les vues**
   - `app/views/home/HomeView.vue` : retirer `BlogSection`
   - `app/views/home/HomeHero.vue` : retirer le bouton vers `/taches`
   - `app/views/legal/SitemapView.vue` : retirer la section Catalogue
   - `app/views/errors/ErrorView.vue` : retirer le lien vers le catalogue
   - `app/views/styleguide/sections/MediaSection.vue` : retirer les cartes de blog et produit
   - `app/views/styleguide/sections/NavigationSection.vue` : retirer pagination et filtres actifs, et pointer le fil d'Ariane d'exemple sur `/contact`
5. **Mettre à jour la navigation et les URL**
   - `app/shared/config/navigation.ts` : retirer `/taches`
   - `tests/support/routes.ts` : retirer `/taches`, `/catalogue` et `/catalogue/plantes-interieur/feuillages`
   - `.lighthouserc.json` : retirer `/taches` et les trois URL `/catalogue`
6. **Adapter les tests restants**
   - `tests/e2e/home.e2e.ts` : retirer l'attente du lien `/taches` et le test des articles
   - `tests/e2e/layout.e2e.ts` : faire porter le test du fil d'Ariane sur `/contact` (deux éléments, `Contact` courant)
   - `tests/e2e/pages.e2e.ts` : retirer `/catalogue/categorie-inconnue` et l'attente du lien catalogue de la 404
   - `tests/e2e/captures.e2e.ts` : capturer `/contact` à la place de `/catalogue`
   - `tests/a11y/pages.a11y.ts` : retirer l'URL filtrée du catalogue et limiter le test du menu ouvert au mobile
7. **Repointer `tools/archSelftest.ts` sur `contact`**
   - Les violations du domaine vont dans `app/modules/contact/domain/` et importent `../infrastructure/sendContactMessage`.
   - Celles du socle, des vues, de `server/` et de `app/` importent `ContactView` ou `@/modules/contact/infrastructure/sendContactMessage`.
   - Celle des types générés va dans `app/modules/contact/ui/`.
   - Retirer les trois entrées qui demandent une couche `application/` ou un second module : « application vers framework », « module vers autre module » et « interface vers infrastructure dans un module à couche application ». Les rétablir dès que le projet a un second module ou une couche application.
8. **Vérifier** : `make qa` doit passer, avec 9 violations volontaires au lieu de 12. Lancer ensuite `make test-e2e` et `make test-a11y`.
9. **Mettre à jour la documentation** : le tableau des pages de démonstration et les recettes de ce README, et les paragraphes du `CLAUDE.md` qui décrivent le catalogue.

## Licence

MIT
