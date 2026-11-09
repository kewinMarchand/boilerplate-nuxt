<script setup lang="ts">
import { computed } from 'vue'

import {
  languageLinks,
  languageName,
  useDictionary,
  useLocale,
  usePageAlternates,
} from '@/shared/i18n'

const t = useDictionary()
const locale = useLocale()
const alternates = usePageAlternates()
const links = computed(() => languageLinks(locale, alternates.value))
</script>

<!--
  Absent sur un site monolingue. Des liens simples, pas des NuxtLink : changer de langue recharge la
  page (`<html lang>`, libellés, données), et marche sans JavaScript.
-->
<template>
  <nav
    v-if="locale.locales.length > 1"
    :aria-label="t.layout.languages"
    class="app-container languages"
    data-testid="layout-languages"
  >
    <ul class="languages-list">
      <li v-for="link in links" :key="link.locale">
        <a
          :href="link.href"
          :lang="link.locale"
          :hreflang="link.locale"
          :aria-current="link.locale === locale.locale ? 'true' : undefined"
          class="languages-link"
          :data-testid="`layout-language-${link.locale}`"
          >{{ languageName(link.locale) }}</a
        >
      </li>
    </ul>
  </nav>
</template>

<style scoped>
/* Bande au-dessus de la barre d'en-tête, alignée à droite, sur le fond de l'en-tête. */
.languages {
  display: flex;
  justify-content: flex-end;
}

.languages-list {
  display: flex;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.languages-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding-inline: var(--bui-space-2);
  border-radius: var(--bui-radius-md);
  color: inherit;
  font-size: var(--bui-font-size-body-sm);
  text-decoration: none;
}

.languages-link:hover {
  text-decoration: underline;
}

.languages-link:focus-visible {
  outline: 2px solid currentcolor;
  outline-offset: 2px;
}

.languages-link[aria-current='true'] {
  font-weight: var(--bui-font-weight-bold);
  text-decoration: underline;
}
</style>
