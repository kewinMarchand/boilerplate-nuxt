<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

import { largestWebp } from '@/shared/ui/kit'

import type { ResponsiveImage } from '@/shared/ui/kit'

/** Images de la fiche, l'image principale en premier. */
const { images } = defineProps<{ images: ResponsiveImage[]; sizes: string }>()

const current = ref(0)
const thumbs = useTemplateRef<HTMLUListElement>('thumbs')

const thumbLabel = (index: number) => `Voir l’image ${index + 1} sur ${images.length}`

const STEPS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 }

const onKeydown = (event: KeyboardEvent, index: number) => {
  const step = STEPS[event.key]
  if (!step) return
  event.preventDefault()
  current.value = (index + step + images.length) % images.length
  thumbs.value?.querySelectorAll('button').item(current.value).focus()
}
</script>

<template>
  <div class="gallery" data-testid="product-gallery">
    <picture :key="current" class="bui-picture">
      <source
        v-for="source in images[current]?.sources"
        :key="source.type"
        :type="source.type"
        :srcset="source.srcset"
        :sizes="sizes"
      />
      <img
        :src="images[current]?.src"
        :alt="images[current]?.alt"
        :width="images[current]?.width"
        :height="images[current]?.height"
        fetchpriority="high"
        decoding="async"
        class="gallery-image"
        data-testid="product-gallery-image"
      />
    </picture>
    <ul ref="thumbs" class="gallery-thumbs">
      <li v-for="(image, index) in images" :key="image.src">
        <button
          type="button"
          class="gallery-thumb requires-js"
          :aria-label="thumbLabel(index)"
          :aria-current="index === current ? 'true' : undefined"
          data-testid="product-gallery-thumb"
          @click="current = index"
          @keydown="onKeydown($event, index)"
        >
          <img
            :src="image.src"
            alt=""
            :width="image.width"
            :height="image.height"
            loading="lazy"
            decoding="async"
            class="gallery-thumb-image"
          />
        </button>
        <a
          :href="largestWebp(image)"
          class="gallery-thumb no-js-only"
          :aria-label="thumbLabel(index)"
          data-testid="product-gallery-thumb-link"
        >
          <img
            :src="image.src"
            alt=""
            :width="image.width"
            :height="image.height"
            loading="lazy"
            decoding="async"
            class="gallery-thumb-image"
          />
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.bui-picture {
  border-radius: var(--bui-radius-md);
}

.gallery-image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--bui-radius-md);
}

.gallery-thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--bui-space-2);
  margin: var(--bui-space-4) 0 0;
  padding: 0;
  list-style: none;
}

.gallery-thumb {
  display: block;
  width: 72px;
  padding: 2px;
  border: 2px solid transparent;
  border-radius: var(--bui-radius-md);
  background: none;
  cursor: pointer;
}

.gallery-thumb[aria-current='true'] {
  border-color: var(--bui-color-primary);
}

.gallery-thumb:focus-visible {
  outline: 3px solid var(--bui-color-primary);
  outline-offset: 2px;
}

.gallery-thumb-image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 4px;
}
</style>
