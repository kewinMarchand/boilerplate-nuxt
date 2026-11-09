import { VueQueryPlugin } from '@tanstack/vue-query'
import { render } from '@testing-library/vue'
import { ref } from 'vue'

import { I18N, MONOLINGUAL } from '@/shared/i18n'
import { fr } from '@/shared/i18n/dictionaries/fr'
import { makeQueryClient } from '@/shared/providers'

type RenderParameters = Parameters<typeof render>

export const renderWithProviders = (
  component: RenderParameters[0],
  options: RenderParameters[1] = {},
) =>
  render(component, {
    ...options,
    global: {
      ...options.global,
      plugins: [[VueQueryPlugin, { queryClient: makeQueryClient() }]],
      provide: { [I18N]: { locale: ref(MONOLINGUAL), dictionary: ref(fr) } },
    },
  })
