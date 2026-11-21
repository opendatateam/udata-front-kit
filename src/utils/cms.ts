import type { CmsCategoryConfig } from '@/model/config'

const CATEGORY_TAG_PREFIX = 'cms-category:'

export const categoryTag = (categoryId: string): string =>
  `${CATEGORY_TAG_PREFIX}${categoryId}`

export const categoryIdFromTags = (tags: string[]): string | null => {
  const tag = tags.find((t) => t.startsWith(CATEGORY_TAG_PREFIX))
  return tag ? tag.slice(CATEGORY_TAG_PREFIX.length) : null
}

export const categoryFromTags = (
  categories: CmsCategoryConfig[],
  tags: string[]
): CmsCategoryConfig | null => {
  const categoryId = categoryIdFromTags(tags)
  return categories.find((c) => c.id === categoryId) ?? null
}

// replaces any existing category tag with the given one, leaving other tags untouched
export const withCategoryTag = (
  tags: string[],
  categoryId: string | null
): string[] => {
  const withoutCategory = tags.filter((t) => !t.startsWith(CATEGORY_TAG_PREFIX))
  return categoryId
    ? [...withoutCategory, categoryTag(categoryId)]
    : withoutCategory
}
