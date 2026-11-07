<script setup lang="ts">
import { useHead } from '#imports'

import { formatPrice } from '../domain/price'
import { EXPOSURE_LABELS, SIZE_LABELS } from './labels'

import type { Catalog } from '../domain/catalog'

const {
  product,
  eager = false,
  priority = false,
} = defineProps<{ product: Catalog.Product; eager?: boolean; priority?: boolean }>()

const SIZES = '(min-width: 1024px) 280px, (min-width: 480px) 50vw, calc(100vw - 58px)'
const preload = product.image?.sources[0]

if (priority && preload) {
  useHead({
    link: [
      {
        rel: 'preload',
        as: 'image',
        type: preload.type,
        imagesrcset: preload.srcset,
        imagesizes: SIZES,
        fetchpriority: 'high',
      },
    ],
  })
}
</script>

<template>
  <article :id="`produit-${product.slug}`" class="product-card" data-testid="catalog-product">
    <div class="product-card-inner">
      <picture v-if="product.image">
        <source
          v-for="source in product.image.sources"
          :key="source.type"
          :type="source.type"
          :srcset="source.srcset"
          :sizes="SIZES"
        />
        <img
          :src="product.image.src"
          :alt="product.image.alt"
          :width="product.image.width"
          :height="product.image.height"
          :loading="eager ? 'eager' : 'lazy'"
          :fetchpriority="priority ? 'high' : undefined"
          decoding="async"
          class="product-image"
        />
      </picture>
      <div v-else class="product-placeholder" />
      <div class="product-body">
        <h2 class="product-name">{{ product.name }}</h2>
        <p class="product-price" data-testid="catalog-product-price">
          {{ formatPrice(product.price) }}
        </p>
        <dl class="product-specs">
          <div>
            <dt>Exposition</dt>
            <dd>{{ EXPOSURE_LABELS[product.exposure] }}</dd>
          </div>
          <div>
            <dt>Taille</dt>
            <dd>{{ SIZE_LABELS[product.size] }}</dd>
          </div>
        </dl>
        <p v-if="!product.inStock" class="product-badge">Rupture de stock</p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  container-type: inline-size;
}

.product-card-inner {
  display: grid;
  align-content: start;
  gap: 12px;
  height: 100%;
  padding: 12px;
  border: 1px solid var(--bui-color-border-subtle);
  border-radius: 8px;
}

.product-image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--bui-radius-md);
}

.product-placeholder {
  aspect-ratio: 1 / 1;
  border-radius: var(--bui-radius-md);
  background: var(--bui-color-surface-muted);
}

.product-name {
  font-size: var(--bui-font-size-h4);
  margin-bottom: 4px;
}

.product-price {
  font-weight: 600;
  margin-bottom: 8px;
}

.product-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  margin-bottom: 8px;
  font-size: var(--bui-font-size-body-sm);
}

.product-specs div {
  display: flex;
  gap: 4px;
}

.product-specs dd {
  margin: 0;
}

.product-specs dt::after {
  content: ' :';
}

.product-badge {
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid currentColor;
  border-radius: 4px;
  color: var(--bui-color-error);
  font-weight: 600;
  margin-bottom: 0;
}

@container (min-width: 560px) {
  .product-card-inner {
    grid-template-columns: 160px 1fr;
    align-items: start;
  }
}
</style>
