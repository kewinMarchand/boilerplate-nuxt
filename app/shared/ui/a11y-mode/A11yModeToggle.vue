<script setup lang="ts">
import { useDictionary } from '@/shared/i18n'
import { useA11yMode } from '@/shared/ui/a11y-mode'
import { Icon } from '@/shared/ui/kit'

const t = useDictionary()
const { isEnhanced, toggle } = useA11yMode()
</script>

<template>
  <button
    type="button"
    class="bui-button bui-button--nav a11y-mode-toggle"
    :aria-label="t.a11yMode.label"
    :aria-pressed="isEnhanced ? 'true' : 'false'"
    data-testid="a11y-mode-toggle"
    @click="toggle"
  >
    <Icon name="person-standing" />
    <span class="a11y-mode-toggle-label" data-testid="a11y-mode-toggle-label">{{
      t.a11yMode.label
    }}</span>
  </button>
</template>

<style scoped>
.a11y-mode-toggle {
  flex-shrink: 0;
  min-width: var(--bui-size-touch);
  padding-inline: 0;
  border-color: currentcolor;
}

.a11y-mode-toggle-label {
  display: none;
}

@media (min-width: 1024px) {
  .a11y-mode-toggle {
    padding-inline: var(--bui-space-4);
  }

  .a11y-mode-toggle-label {
    display: inline;
  }

  /* Texte agrandi : le libellé visible ne tient plus dans le header avec la bascule du thème ; icône seule, nom accessible gardé */
  [data-a11y-mode='enhanced'] .a11y-mode-toggle {
    padding-inline: 0;
  }

  [data-a11y-mode='enhanced'] .a11y-mode-toggle-label {
    display: none;
  }
}
</style>
