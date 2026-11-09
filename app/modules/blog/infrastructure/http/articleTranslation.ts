import type { Article } from '@/modules/blog/domain/article'
import type { components } from '@/shared/api/client'

type ArticleDto = components['schemas']['Article']
type ArticleDetailDto = components['schemas']['ArticleDetail']
type ArticleTermDto = components['schemas']['ArticleTerm']

export const toArticleTerm = (dto: ArticleTermDto): Article.Term => ({
  slug: dto.slug,
  name: dto.name,
})

export const toArticle = (dto: ArticleDto): Article.Entity => ({
  id: String(dto.id),
  slug: dto.slug,
  title: dto.title,
  excerpt: dto.excerpt,
  publishedAt: dto.publishedAt,
  image: dto.image,
  section: dto.section && toArticleTerm(dto.section),
  format: dto.format && toArticleTerm(dto.format),
  audio: dto.audio && {
    src: dto.audio.src,
    type: dto.audio.type,
    durationSeconds: dto.audio.durationSeconds,
  },
  speaker: dto.speaker,
})

export const toArticleDetail = (dto: ArticleDetailDto): Article.Detail => ({
  ...toArticle(dto),
  html: dto.html,
  metaTitle: dto.metaTitle,
  metaDescription: dto.metaDescription,
  alternates: dto.alternates.map(({ locale, slug }) => ({ locale, slug })),
})
