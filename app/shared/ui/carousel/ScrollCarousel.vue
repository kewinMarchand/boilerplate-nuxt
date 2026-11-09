<script setup lang="ts">
import { useId } from 'vue'

import { Button } from '@kewinmarchand/boilerplates-ui/vue'

import { format, useDictionary, useLocalizePath } from '@/shared/i18n'

import { useCarousel } from './useCarousel'

import type { Carousel } from './carousel'

const { slides, labelledby } = defineProps<{
  slides: Carousel.Slide[]
  labelledby: string
}>()

const SLIDE_SIZES =
  '(min-width: 1024px) calc((min(100vw, 1440px) - 64px) / 3), (min-width: 640px) calc(50vw - 40px), calc((100vw - 32px) * 0.85)'

const t = useDictionary()
const localizePath = useLocalizePath()
const trackId = useId()
const { viewport, isReady, snapCount, selectedIndex, canPrev, canNext, prev, next, goTo } =
  useCarousel()

const setViewport = (element: unknown) => {
  viewport.value = element instanceof HTMLElement ? element : undefined
}
</script>

<template>
  <section :aria-roledescription="t.carousel.roleDescription" :aria-labelledby="labelledby">
    <slot />
    <div
      :ref="setViewport"
      class="carousel-viewport"
      :class="{ 'is-ready': isReady }"
      :tabindex="isReady ? undefined : 0"
    >
      <div :id="trackId" class="carousel-track" data-testid="carousel-track">
        <div
          v-for="(slide, position) in slides"
          :key="slide.id"
          class="carousel-slide"
          role="group"
          :aria-roledescription="t.carousel.slideRoleDescription"
          :aria-label="
            format(t.carousel.position, { position: position + 1, total: slides.length })
          "
          data-testid="carousel-slide"
        >
          <template v-if="slide.image">
            <picture v-if="position === 0 || isReady" class="bui-picture">
              <source
                v-for="source in slide.image.sources"
                :key="source.type"
                :type="source.type"
                :srcset="source.srcset"
                :sizes="SLIDE_SIZES"
              />
              <img
                :src="slide.image.src"
                :alt="slide.image.alt"
                :width="slide.image.width"
                :height="slide.image.height"
                loading="lazy"
                decoding="async"
                draggable="false"
                class="carousel-image"
              />
            </picture>
            <template v-else>
              <div
                class="carousel-placeholder"
                :style="{ aspectRatio: `${slide.image.width} / ${slide.image.height}` }"
              />
              <noscript data-allow-mismatch="children">
                <img
                  :src="slide.image.src"
                  :alt="slide.image.alt"
                  :width="slide.image.width"
                  :height="slide.image.height"
                  loading="lazy"
                  class="carousel-image"
                />
              </noscript>
            </template>
          </template>
          <h3 class="carousel-title">
            <!-- Après un glisser, Embla annule le clic : la diapositive ne s'ouvre pas en fin de geste -->
            <NuxtLink
              v-if="slide.href"
              :to="localizePath(slide.href)"
              draggable="false"
              class="bui-link carousel-link"
              data-testid="carousel-slide-link"
            >
              {{ slide.title }}
            </NuxtLink>
            <template v-else>{{ slide.title }}</template>
          </h3>
          <p v-if="slide.text">{{ slide.text }}</p>
        </div>
      </div>
    </div>
    <div class="carousel-controls">
      <div class="carousel-dots">
        <button
          v-for="index in snapCount"
          :key="index"
          type="button"
          class="carousel-dot"
          :aria-label="format(t.carousel.goTo, { position: index })"
          :aria-current="selectedIndex === index - 1 ? 'true' : undefined"
          :aria-controls="trackId"
          data-testid="carousel-dot"
          @click="goTo(index - 1)"
        />
      </div>
      <Button
        variant="outline"
        icon="chevron-left"
        :aria-controls="trackId"
        :disabled="!canPrev"
        data-testid="carousel-prev"
        @click="prev"
      >
        {{ t.carousel.previous }}
      </Button>
      <Button
        variant="outline"
        icon="chevron-right"
        icon-position="end"
        :aria-controls="trackId"
        :disabled="!canNext"
        data-testid="carousel-next"
        @click="next"
      >
        {{ t.carousel.next }}
      </Button>
    </div>
  </section>
</template>

<style scoped>
.carousel-viewport {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.carousel-viewport.is-ready {
  overflow: visible;
  scroll-snap-type: none;
}

.carousel-track {
  display: flex;
  touch-action: pan-y pinch-zoom;
  margin-left: -16px;
}

.carousel-slide {
  position: relative;
  flex: 0 0 85%;
  min-width: 0;
  padding-left: 16px;
  scroll-snap-align: start;
}

.bui-picture,
.carousel-image,
.carousel-placeholder {
  border-radius: var(--bui-radius-md);
}

.carousel-image {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
}

.carousel-placeholder {
  background: var(--bui-color-surface-muted);
}

html:not([data-js]) .carousel-placeholder {
  display: none;
}

/* Lien étiré sur toute la diapositive : un seul lien, nommé par le titre */
.carousel-link::after {
  content: '';
  position: absolute;
  inset: 0;
}

.carousel-title {
  margin-top: var(--bui-space-4);
}

.carousel-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--bui-space-2);
  min-height: var(--bui-size-touch);
}

.carousel-dots {
  display: flex;
  flex-wrap: wrap;
  flex-grow: 1;
  gap: var(--bui-space-1);
}

.carousel-dot {
  position: relative;
  width: var(--bui-size-touch);
  height: var(--bui-size-touch);
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.carousel-dot::after {
  content: '';
  position: absolute;
  inset: 14px;
  border-radius: 50%;
  border: 2px solid var(--bui-color-primary);
}

.carousel-dot[aria-current='true']::after {
  background: var(--bui-color-primary);
}

.carousel-dot:focus-visible {
  outline: 3px solid var(--bui-color-primary);
}

@media (min-width: 640px) {
  .carousel-slide {
    flex-basis: 50%;
  }
}

@media (min-width: 1024px) {
  .carousel-slide {
    flex-basis: calc(100% / 3);
  }
}
</style>
