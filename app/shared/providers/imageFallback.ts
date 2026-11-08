import { defineNuxtPlugin } from '#imports'

import { initImageFallback } from '@kewinmarchand/boilerplates-ui/vanilla'

export default defineNuxtPlugin(() => {
  initImageFallback()
})
