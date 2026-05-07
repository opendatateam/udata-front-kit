import { useHead } from '@unhead/vue'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

import { stripFromMarkdown } from '@/utils'

// Google displays ~160 chars; 155 gives a safe margin before it truncates
const META_DESCRIPTION_MAX_LENGTH = 155

export function toMetaDescription(value: string | null | undefined): string {
  if (!value) return ''
  const plain = stripFromMarkdown(value)
  if (plain.length <= META_DESCRIPTION_MAX_LENGTH) return plain
  return plain.slice(0, META_DESCRIPTION_MAX_LENGTH).trimEnd() + '…'
}

export function useCanonical(
  href: MaybeRefOrGetter<string | undefined | null>
) {
  useHead({
    link: () => {
      const url = toValue(href)
      return url ? [{ rel: 'canonical', href: url }] : []
    }
  })
}
