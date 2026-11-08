<script setup lang="ts">
import { computed } from 'vue'
import { useHead, useRoute, useRuntimeConfig } from '#imports'

import { Alert } from '@kewinmarchand/boilerplates-ui/vue'

import { usePageSeo } from '@/shared/seo'
import { largestWebp } from '@/shared/ui/kit'
import { AppBreadcrumb } from '@/shared/ui/layout'

import { productHref } from '../domain/catalog'
import { categoryTrail } from '../domain/categoryPath'
import { formatPrice } from '../domain/price'
import { useProduct } from './composables/useProduct'
import { EXPOSURE_LABELS } from './labels'
import ProductGallery from './ProductGallery.vue'
import SimilarProducts from './SimilarProducts.vue'

import type { Catalog } from '../domain/catalog'

/** Bouton d'achat, fourni par la couche de routage (module panier). */
defineSlots<{ purchase?: (props: { product: Catalog.ProductDetail }) => unknown }>()

const IMAGE_SIZES = '(min-width: 1440px) 680px, (min-width: 768px) 50vw, calc(100vw - 32px)'

const route = useRoute()
const slug = String(route.params['slug'])
const { status, data: product, error } = await useProduct(slug)
const { siteUrl } = useRuntimeConfig().public

const path = productHref(slug)
const title = computed(() => product.value?.name ?? 'Produit')
const category = computed(() => product.value?.categoryPath.at(-1))
const galleryImages = computed(() =>
  product.value?.gallery.length
    ? [...(product.value.image ? [product.value.image] : []), ...product.value.gallery]
    : [],
)
const trail = computed(() => [
  ...categoryTrail(product.value?.categoryPath ?? []),
  { label: title.value, href: path },
])

usePageSeo({
  title,
  adminTitle: () => product.value?.metaTitle ?? '',
  description: () => {
    const value = product.value
    if (!value) return title.value
    if (value.metaDescription) return value.metaDescription
    return `${value.name} : exposition ${EXPOSURE_LABELS[value.exposure].toLowerCase()}, taille ${value.size}, ${formatPrice(value.price)}. ${value.inStock ? 'En stock' : 'En rupture de stock'}, rayon ${category.value?.label ?? 'catalogue'}.`
  },
  noindex: () => !product.value,
  breadcrumbTrail: trail,
  image: () => {
    const image = product.value?.image
    return image
      ? {
          path: largestWebp(image),
          width: image.width,
          height: image.height,
          alt: image.alt || title.value,
        }
      : undefined
  },
  jsonLd: () =>
    product.value
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.value.name,
            ...(product.value.description.length > 0 && {
              description: product.value.description.join(' '),
            }),
            sku: product.value.slug,
            url: new URL(path, siteUrl).href,
            ...(category.value && { category: category.value.label }),
            ...(product.value.image && { image: largestWebp(product.value.image) }),
            offers: {
              '@type': 'Offer',
              url: new URL(path, siteUrl).href,
              priceCurrency: 'EUR',
              price: (product.value.price / 100).toFixed(2),
              availability: `https://schema.org/${product.value.inStock ? 'InStock' : 'OutOfStock'}`,
            },
          },
        ]
      : [],
})

// Image LCP de la fiche : préchargée en tête de page
useHead({
  link: () => {
    const first = product.value?.image?.sources[0]
    return first
      ? [
          {
            rel: 'preload',
            as: 'image',
            type: first.type,
            imagesrcset: first.srcset,
            imagesizes: IMAGE_SIZES,
            fetchpriority: 'high',
          },
        ]
      : []
  },
})
</script>

<template>
  <AppBreadcrumb :trail="[{ label: 'Accueil', href: '/' }, ...trail]" />
  <template v-if="status === 'error'">
    <h1>Produit</h1>
    <Alert variant="error" data-testid="product-error">{{ error?.message }}</Alert>
  </template>
  <article v-else-if="product" class="product" data-testid="product-page">
    <ProductGallery v-if="galleryImages.length > 0" :images="galleryImages" :sizes="IMAGE_SIZES" />
    <picture v-else-if="product.image">
      <source
        v-for="source in product.image.sources"
        :key="source.type"
        :type="source.type"
        :srcset="source.srcset"
        :sizes="IMAGE_SIZES"
      />
      <img
        :src="product.image.src"
        :alt="product.image.alt"
        :width="product.image.width"
        :height="product.image.height"
        fetchpriority="high"
        decoding="async"
        class="product-image"
      />
    </picture>
    <div>
      <h1 class="product-title" data-testid="product-title">{{ product.name }}</h1>
      <p class="product-price" data-testid="product-price">{{ formatPrice(product.price) }}</p>
      <div v-if="product.description.length > 0" data-testid="product-description">
        <p v-for="paragraph in product.description" :key="paragraph" class="product-paragraph">
          {{ paragraph }}
        </p>
      </div>
      <dl class="product-features">
        <dt>Exposition</dt>
        <dd>{{ EXPOSURE_LABELS[product.exposure] }}</dd>
        <dt>Taille</dt>
        <dd>{{ product.size }}</dd>
        <dt>Disponibilité</dt>
        <dd>
          <template v-if="product.inStock">En stock</template>
          <span v-else class="product-badge">Rupture de stock</span>
        </dd>
      </dl>
      <dl
        v-if="product.attributes.length > 0"
        class="product-features"
        data-testid="product-attributes"
      >
        <template v-for="attribute in product.attributes" :key="attribute.code">
          <dt>{{ attribute.label }}</dt>
          <dd>{{ attribute.unit ? `${attribute.value} ${attribute.unit}` : attribute.value }}</dd>
        </template>
      </dl>
      <slot name="purchase" :product="product" />
      <p v-if="category">
        <NuxtLink :to="category.href" class="bui-link">
          Voir les autres produits : {{ category.label }}
        </NuxtLink>
      </p>
    </div>
  </article>
  <SimilarProducts
    v-if="product"
    :category-slug="product.categorySlug"
    :product-slug="product.slug"
    class="product-similar"
  />
</template>

<style scoped>
.product {
  display: grid;
  gap: var(--bui-space-8);
  align-items: start;
}

@media (min-width: 768px) {
  .product {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.product-similar {
  margin-block-start: var(--bui-space-12);
}

.product-image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--bui-radius-md);
}

.product-title {
  overflow-wrap: break-word;
}

.product-price {
  font-size: var(--bui-font-size-lead);
  font-weight: 600;
}

.product-paragraph {
  margin-block: 0 var(--bui-space-4);
}

.product-features {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--bui-space-2) var(--bui-space-6);
  margin-block: var(--bui-space-6);
}

.product-features dt {
  font-weight: 600;
}

.product-features dd {
  margin: 0;
}

.product-badge {
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid currentColor;
  border-radius: 4px;
  color: var(--bui-color-error);
  font-weight: 600;
}
</style>
