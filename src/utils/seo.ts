import { useHead } from '@unhead/vue'
import type { Ref } from 'vue'
import { inject, toValue, watch } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'

import config from '@/config'
import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from '@/model/injectionKeys'
import { stripFromMarkdown } from '@/utils'
import { DebugLogger } from '@/utils/debug'

const debug = new DebugLogger('useMeta')

type ReactiveInput<T> = Ref<T> | (() => T)

// Google displays ~160 chars; 155 gives a safe margin before it truncates
const META_DESCRIPTION_MAX_LENGTH = 155

export function toMetaDescription(value: string | null | undefined): string {
  if (!value) return ''
  return stripFromMarkdown(value, META_DESCRIPTION_MAX_LENGTH)
}

function toMetaKeywords(keywords: string[] | undefined): string | undefined {
  return keywords?.length ? keywords.join(', ') : undefined
}

export function useCanonicalUrl(
  getRoute?: () => RouteLocationRaw | null | undefined
): () => string | null {
  const router = useRouter()
  return () => {
    if (!getRoute)
      return `${window.location.origin}${router.currentRoute.value.path}`
    const route = getRoute()
    if (!route) return null
    return `${window.location.origin}${router.resolve(route).href}`
  }
}

export function useMeta({
  title,
  description,
  keywords,
  canonicalUrl,
  noIndex
}: {
  title?: ReactiveInput<string | undefined>
  description: ReactiveInput<string | undefined>
  keywords?: ReactiveInput<string[] | undefined>
  canonicalUrl: ReactiveInput<string | undefined | null>
  noIndex?: ReactiveInput<boolean | undefined>
}) {
  const route = useRoute()
  const setAccessibilityProperties = inject(
    AccessibilityPropertiesKey
  ) as AccessibilityPropertiesType

  // Explicit title takes precedence; fall back to route.meta.title for pages
  // that define their title in the router (list pages, home, 404…)
  const resolvedTitle = () => toValue(title) ?? (route.meta.title || undefined)

  const fullTitle = () => {
    const t = resolvedTitle()
    return t ? `${t} | ${config.website.title}` : config.website.title
  }

  if (!resolvedTitle()) {
    debug.warn(`route "${String(route.name)}" has no title`)
  }

  watch(
    resolvedTitle,
    (t) => {
      if (t) setAccessibilityProperties(t)
    },
    { immediate: true }
  )

  const args = {
    title: fullTitle,
    meta: () => {
      const metaDescription = toMetaDescription(toValue(description))
      const metaKeywords = toMetaKeywords(toValue(keywords))
      return [
        {
          property: 'og:title',
          content: fullTitle()
        },
        { name: 'description', content: metaDescription },
        { property: 'og:description', content: metaDescription },
        ...(metaKeywords != null
          ? [{ name: 'keywords', content: metaKeywords }]
          : []),
        ...(toValue(noIndex)
          ? [{ name: 'robots', content: 'noindex, nofollow' }]
          : [])
      ]
    },
    link: () => {
      const url = toValue(canonicalUrl)
      return url ? [{ rel: 'canonical', href: url }] : []
    }
  }
  useHead(args)
}
