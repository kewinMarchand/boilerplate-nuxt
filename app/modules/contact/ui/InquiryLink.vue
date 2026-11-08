<script setup lang="ts">
/** Remplace « Ajouter au panier » quand la vente en ligne est coupée ; présent sans JavaScript et en rupture de stock. */
const { slug, name } = defineProps<{ slug: string; name: string }>()
</script>

<template>
  <p class="inquiry">
    <!-- Nom accessible « Demande de renseignement sur <produit> » : texte visible complété, sans aria-label -->
    <NuxtLink
      :to="{ path: '/contact', query: { produit: slug } }"
      class="bui-button inquiry-link"
      data-testid="product-inquiry"
    >
      Demande de renseignement<span class="bui-visually-hidden"> sur {{ name }}</span>
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
