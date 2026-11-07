<script setup lang="ts">
// HTML venu de l'API (pages légales, articles), injecté tel quel : l'API échappe le HTML saisi dans l'admin et retire les liens dangereux
defineProps<{ html: string }>()
</script>

<template>
  <div class="rich-html" v-html="html" />
</template>

<style scoped>
/* HTML sans classe : les liens reprennent `bui-link` de la bibliothèque */
.rich-html :deep(h2) {
  margin-block-start: var(--bui-space-8);
}

.rich-html :deep(code) {
  font-family: ui-monospace, monospace;
  font-size: 0.9em;
}

.rich-html :deep(a) {
  color: var(--bui-color-primary);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
}

.rich-html :deep(a:hover) {
  color: var(--bui-color-primary-dark);
  text-decoration-thickness: 2px;
}

.rich-html :deep(a:focus-visible) {
  border-radius: 2px;
  outline: var(--bui-focus-width) solid var(--bui-color-primary);
  outline-offset: var(--bui-focus-offset);
}
</style>
