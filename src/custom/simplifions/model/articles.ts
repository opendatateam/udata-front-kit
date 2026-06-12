import type { BreadcrumbItem } from '@/model/breadcrumb'

export type SimplifionsFolderMeta = {
  id: string
  label: string
  title: string
  description: string
  children: string[]
  heroImageSrc?: string
  heroBackdropGradient?: string
}

export type SimplifionsArticleMeta = {
  id: string
  h1: string
  title: string
  description: string
}

export type SimplifionsArticleAudienceTag = {
  label: string
  href?: string
}

export type SimplifionsArticleCategory = 'guide' | 'liste' | 'palmares' | 'veille'

export type SimplifionsArticleCardBadge = {
  label: string
  className: string
}

export type SimplifionsArticleCard = {
  id: string
  title: string
  description: string
  to: string
  imageSrc?: string
  heroBackdropGradient: string
  articleCategory?: SimplifionsArticleCategory
  badges: SimplifionsArticleCardBadge[]
  tags: SimplifionsArticleAudienceTag[]
}

type SimplifionsArticleMetaForCard = SimplifionsArticleMeta & {
  imageSrc?: string
  heroBackdropGradient: string
  articleTags?: readonly SimplifionsArticleAudienceTag[]
  articleCategory?: SimplifionsArticleCategory
  showNoDevelopmentBadge?: boolean
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
    },
    veille: {
      label: 'Veille',
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

export type FeaturedItem =
  | { type: 'folder'; meta: SimplifionsFolderMeta; to: string; articleCount: number }
  | { type: 'article'; card: SimplifionsArticleCard }

export const buildSimplifionsArticleCard = (
  folderMeta: SimplifionsFolderMeta | null,
  articleMeta: SimplifionsArticleMetaForCard,
  parentPath = ''
): SimplifionsArticleCard => {
  return {
    id: articleMeta.id,
    title: articleMeta.h1,
    description: articleMeta.description,
    to: folderMeta
      ? `${parentPath}/${folderMeta.id}/${articleMeta.id}`
      : `${parentPath}/${articleMeta.id}`,
    imageSrc: articleMeta.imageSrc,
    heroBackdropGradient: articleMeta.heroBackdropGradient,
    articleCategory: articleMeta.articleCategory,
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
  articleMeta: TArticleMeta,
  ancestorLinks: readonly BreadcrumbItem[] = [],
  folderPathPrefix = ''
) => {
  const breadcrumbLinks: BreadcrumbItem[] = [
    { to: '/', text: 'Accueil' },
    ...ancestorLinks
  ]

  if (folderMeta) {
    breadcrumbLinks.push({
      to: `${folderPathPrefix}/${folderMeta.id}`,
      text: folderMeta.title
    })
  }

  breadcrumbLinks.push({ text: articleMeta.h1 })

  return {
    article: {
      ...articleMeta,
      ...(folderMeta ? { parentId: folderMeta.id } : {})
    } as TArticleMeta & { parentId?: string },
    articleKicker: folderMeta?.label,
    breadcrumbLinks
  }
}
