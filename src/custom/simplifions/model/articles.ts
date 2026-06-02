import type { BreadcrumbItem } from '@/model/breadcrumb'

export type SimplifionsFolderMeta = {
  id: string
  label: string
  title: string
  slug: string
}

export type SimplifionsArticleMeta = {
  id: string
  title: string
  description: string
  slug: string
}

export type SimplifionsArticleAudienceTag = {
  label: string
  href?: string
}

export type SimplifionsArticleCategory = 'guide' | 'liste' | 'palmares'

export type SimplifionsArticleCardBadge = {
  label: string
  className: string
}

export type SimplifionsArticleCard = {
  title: string
  description: string
  to: string
  imageSrc: string
  imageAlt?: string
  heroBackdropGradient: string
  badges: SimplifionsArticleCardBadge[]
  tags: SimplifionsArticleAudienceTag[]
}

type SimplifionsArticleMetaForCard = SimplifionsArticleMeta & {
  imageSrc?: string
  imageAlt?: string
  heroBackdropGradient: string
  articleTags?: readonly SimplifionsArticleAudienceTag[]
  articleCategory?: SimplifionsArticleCategory
  showNoDevelopmentBadge?: boolean
}

const colorFromGradient = (gradient: string): string[] => {
  const colors = gradient.match(/#[0-9a-fA-F]{3,8}/g) ?? []
  if (colors.length >= 2) return [colors[0]!, colors[1]!]
  if (colors.length === 1) return [colors[0]!, colors[0]!]
  return ['#1b1b35', '#1e1e1e']
}

export const buildSimplifionsGradientImage = (gradient: string): string => {
  const [start, end] = colorFromGradient(gradient)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="none">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#g)" />
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`
}

const buildArticleCategoryBadge = (
  articleCategory?: SimplifionsArticleCategory
): SimplifionsArticleCardBadge[] => {
  if (!articleCategory) return []

  const byCategory: Record<SimplifionsArticleCategory, SimplifionsArticleCardBadge> = {
    guide: {
      label: 'Guide',
      className: 'fr-badge fr-badge--sm fr-badge--pink-macaron'
    },
    liste: {
      label: 'Liste',
      className: 'fr-badge fr-badge--sm fr-badge--green-menthe'
    },
    palmares: {
      label: 'Palmarès',
      className: 'fr-badge fr-badge--sm fr-badge--brown-caramel'
    }
  }

  return [byCategory[articleCategory]]
}

const buildArticleSpecialBadge = (
  showNoDevelopmentBadge?: boolean
): SimplifionsArticleCardBadge[] => {
  if (!showNoDevelopmentBadge) return []

  return [
    {
      label: 'Sans développement',
      className:
        'fr-badge fr-badge--sm fr-badge--beige-gris-galet fr-badge--icon-left fr-icon-flashlight-line'
    }
  ]
}

export const buildSimplifionsArticleCard = (
  folderMeta: SimplifionsFolderMeta,
  articleMeta: SimplifionsArticleMetaForCard
): SimplifionsArticleCard => {
  return {
    title: articleMeta.title,
    description: articleMeta.description,
    to: `${folderMeta.slug}/${articleMeta.slug}`,
    imageSrc:
      articleMeta.imageSrc ??
      buildSimplifionsGradientImage(articleMeta.heroBackdropGradient),
    imageAlt: articleMeta.imageAlt,
    heroBackdropGradient: articleMeta.heroBackdropGradient,
    badges: [
      ...buildArticleCategoryBadge(articleMeta.articleCategory),
      ...buildArticleSpecialBadge(articleMeta.showNoDevelopmentBadge)
    ],
    tags: [...(articleMeta.articleTags ?? [])]
  }
}

export const buildSimplifionsArticlePageMeta = <
  TArticleMeta extends SimplifionsArticleMeta
>(
  folderMeta: SimplifionsFolderMeta | null | undefined,
  articleMeta: TArticleMeta
) => {
  const breadcrumbLinks: BreadcrumbItem[] = [
    { to: '/', text: 'Accueil' }
  ]

  if (folderMeta) {
    breadcrumbLinks.push({
      to: folderMeta.slug,
      text: folderMeta.title
    })
  }

  breadcrumbLinks.push({ text: articleMeta.title })

  return {
    article: {
      ...articleMeta,
      ...(folderMeta ? { parentId: folderMeta.id } : {})
    } as TArticleMeta & { parentId?: string },
    articleKicker: folderMeta?.label,
    breadcrumbLinks
  }
}
