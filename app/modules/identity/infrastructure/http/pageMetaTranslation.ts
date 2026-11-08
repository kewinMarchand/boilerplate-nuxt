import { EMPTY_PAGE_METAS } from '@/modules/identity/domain/pageMeta'

import type { PageMeta } from '@/modules/identity/domain/pageMeta'
import type { components } from '@/shared/api/client'

type PageMetaDto = components['schemas']['PageMeta']

/** Une entrée par page fixe ; une page absente de la réponse garde des chaînes vides. */
export const toPageMetas = (dtos: PageMetaDto[]): PageMeta.ByPage => ({
  ...EMPTY_PAGE_METAS,
  ...Object.fromEntries(
    dtos.map((dto) => [dto.page, { title: dto.title, description: dto.description }]),
  ),
})
