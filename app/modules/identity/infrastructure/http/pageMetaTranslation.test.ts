import { EMPTY_PAGE_METAS } from '@/modules/identity/domain/pageMeta'

import { toPageMetas } from './pageMetaTranslation'

describe('toPageMetas', () => {
  it('range titre et description par page', () => {
    const metas = toPageMetas([
      { page: 'blog', title: '', description: 'Conseils et actualités du modèle.' },
      { page: 'contact', title: 'Nous écrire', description: '' },
    ])

    expect(metas.blog).toEqual({ title: '', description: 'Conseils et actualités du modèle.' })
    expect(metas.contact).toEqual({ title: 'Nous écrire', description: '' })
  })

  it('garde des chaînes vides pour une page absente de la réponse', () => {
    expect(toPageMetas([])).toEqual(EMPTY_PAGE_METAS)
  })
})
