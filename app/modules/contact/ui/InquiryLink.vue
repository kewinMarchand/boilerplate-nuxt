<script setup lang="ts">
import { format, useDictionary, useLocalizePath } from '@/shared/i18n'

/** Remplace « Ajouter au panier » quand la vente en ligne est coupée ; présent sans JavaScript et en rupture de stock. */
const { slug, name } = defineProps<{ slug: string; name: string }>()
const t = useDictionary()
const localizePath = useLocalizePath()
</script>

<template>
  <p class="inquiry">
    <!-- Nom accessible « Demande de renseignement sur <produit> » : texte visible complété, sans aria-label -->
    <NuxtLink
      :to="{ path: localizePath('/contact'), query: { produit: slug } }"
      class="bui-button inquiry-link"
      data-testid="product-inquiry"
    >
      {{ t.contact.inquiry
      }}<span class="bui-visually-hidden">{{ format(t.contact.inquiryAbout, { name }) }}</span>
    </NuxtLink>
  </p>
</template>

<style scoped>
.inquiry {
  margin-block: var(--bui-space-6);
}

.inquiry-link {
  min-height: 44px;
}
</style>
