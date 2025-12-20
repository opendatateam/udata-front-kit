import { type Ref, ref } from 'vue'

import config from '@/config'
import type { DataserviceWithRel } from '@/model/dataservice'
import type { ResolvedFactor, Topic } from '@/model/topic'
import { useDataserviceStore } from '@/store/DataserviceStore'
import { useTopicStore } from '@/store/TopicStore'
import { toastHttpError } from '@/utils/error'
import { isNotFoundError } from '@/utils/http'

/**
 * Generic function to extract a slug from a URI based on base URLs and resource path
 */
const getSlugFromUri = (
  uri: string,
  resourcePath: string,
  baseUrls: (string | undefined)[]
): string | null => {
  const validBaseUrls = baseUrls.filter(Boolean)
  if (validBaseUrls.length === 0) return null

  for (const baseUrl of validBaseUrls) {
    const match = uri.match(new RegExp(`${baseUrl}/${resourcePath}/([^/]+)`))
    if (match) return match[1]
  }

  return null
}

/**
 * Generic function to load referenced content (topics or dataservices) from factors
 */
function loadReferencedContent<T>(
  factors: Ref<ResolvedFactor[]>,
  getSlugFn: (uri: string) => string | null,
  contentMap: Map<string, T>,
  store: {
    load: (slug: string, opts: { toasted: boolean }) => Promise<unknown>
  },
  createEntry: (slug: string, content: unknown) => T
): void {
  factors.value.forEach((factor) => {
    if (factor.id && factor.siteExtras?.uri && !factor.element?.id) {
      const slug = getSlugFn(factor.siteExtras.uri)
      if (slug && !contentMap.has(factor.id)) {
        store
          .load(slug, { toasted: false })
          .then((content) => {
            if (content && factor.id) {
              contentMap.set(factor.id, createEntry(slug, content))
            }
          })
          .catch((err) => {
            if (isNotFoundError(err)) {
              factor.remoteDeleted = true
            } else {
              toastHttpError(err)
            }
          })
      }
    }
  })
}

export function useReferencedContent(
  factors: Ref<ResolvedFactor[]>,
  pageKey: string
) {
  const topicsContent = ref(new Map<string, { slug: string; topic: Topic }>())
  const dataservicesContent = ref(
    new Map<string, { slug: string; dataservice: DataserviceWithRel }>()
  )

  const topicStore = useTopicStore()
  const dataserviceStore = useDataserviceStore()

  const getTopicForFactor = (factor: ResolvedFactor): Topic | null => {
    if (!factor.id) return null
    return topicsContent.value.get(factor.id)?.topic || null
  }

  const getDataserviceForFactor = (
    factor: ResolvedFactor
  ): DataserviceWithRel | null => {
    if (!factor.id) return null
    return dataservicesContent.value.get(factor.id)?.dataservice || null
  }

  /**
   * Loads the "local" topics associated to the factors via siteExtras.uri
   */
  const loadTopicsContent = () => {
    loadReferencedContent(
      factors,
      (uri) =>
        getSlugFromUri(uri, pageKey, [config.website.meta?.canonical_url]),
      topicsContent.value,
      topicStore,
      (slug, content) => ({ slug, topic: content as Topic })
    )
  }

  /**
   * Loads the dataservices associated to the factors via siteExtras.uri
   */
  const loadDataservicesContent = () => {
    loadReferencedContent(
      factors,
      (uri) =>
        // match both base urls from data.gouv.fr and current site
        getSlugFromUri(uri, 'dataservices', [
          config.website.meta?.canonical_url,
          config.datagouvfr?.base_url
        ]),
      dataservicesContent.value,
      dataserviceStore,
      (slug, content) => ({ slug, dataservice: content as DataserviceWithRel })
    )
  }

  return {
    topicsContent,
    dataservicesContent,
    getTopicForFactor,
    getDataserviceForFactor,
    loadTopicsContent,
    loadDataservicesContent
  }
}
