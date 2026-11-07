<script setup lang="ts">
import { buildSources } from '@/shared/ui/kit/imageSources'

import { BlogGrid } from '@/modules/blog'
import { eurosToCents, ProductCard } from '@/modules/catalog'

import type { Catalog } from '@/modules/catalog'

const ARTICLE = {
  id: 'exemple',
  title: 'Exemple de carte de blog',
  excerpt: 'Illustration, titre, extrait et date de publication.',
  publishedAt: '2026-10-01',
  image: {
    alt: '',
    width: 1280,
    height: 720,
    sources: buildSources('hero', [640, 1280]),
    src: '/images/hero-1280.webp',
  },
}
const PRODUCT: Catalog.Product = {
  id: 'exemple',
  slug: 'exemple',
  name: 'Anthurium d’exemple',
  categorySlug: 'anthurium',
  price: eurosToCents(29.9),
  exposure: 'mi-ombre',
  size: 'M',
  inStock: false,
  image: null,
}
</script>

<template>
  <section aria-labelledby="charte-medias" data-testid="styleguide-media">
    <h2 id="charte-medias">Médias et cartes</h2>
    <h3>Carte de blog</h3>
    <BlogGrid status="success" :articles="[ARTICLE]" />
    <h3 class="media-title">Carte produit, grille puis liste</h3>
    <div class="product-samples">
      <div class="grid-sample"><ProductCard :product="PRODUCT" /></div>
      <ProductCard :product="{ ...PRODUCT, id: 'exemple-liste', slug: 'exemple-liste' }" />
    </div>
    <h3 class="media-title">Image au ratio 16:9</h3>
    <img
      src="/images/hero-640.webp"
      alt=""
      width="640"
      height="360"
      loading="lazy"
      class="ratio-sample"
    />
  </section>
</template>

<style scoped>
.media-title {
  margin-block-start: var(--bui-space-6);
}

.product-samples {
  display: grid;
  gap: 16px;
}

.grid-sample {
  max-width: 280px;
}

.ratio-sample {
  display: block;
  border-radius: var(--bui-radius-md);
  width: 100%;
  max-width: 640px;
  height: auto;
}
</style>
