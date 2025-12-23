import type { DatasetV2 } from '@datagouv/components-next'
import { type Ref, ref } from 'vue'

import config from '@/config'
import type { DataserviceWithRel } from '@/model/dataservice'
import type { ResolvedFactor, Topic } from '@/model/topic'
import { useDataserviceStore } from '@/store/DataserviceStore'
import { useDatasetStore } from '@/store/OrganizationDatasetStore'
import { useTopicStore } from '@/store/TopicStore'
import { toastHttpError } from '@/utils/error'
import { isNotFoundError } from '@/utils/http'

/**
 * Generic function to extract a slug from a URI based on base URLs and resource path
 */
const getSlugFromUri = (
  uri: string,
  resourceName: string,
  baseUrls: (string | undefined)[]
): string | null => {
  const validBaseUrls = baseUrls.filter(Boolean)
  if (validBaseUrls.length === 0) return null

  for (const baseUrl of validBaseUrls) {
    const match = uri.match(new RegExp(`${baseUrl}/${resourceName}/([^/]+)`))
    if (match) return match[1]
  }

  return null
}

/**
 * Generic function to load URI-referenced content (topics or dataservices) from factors
 */
function loadURIReferencedContent<T>(
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

export function useTopicReferencedContent(
  factors: Ref<ResolvedFactor[]>,
  pageKey: string
) {
  const topicsContent = ref(new Map<string, { slug: string; topic: Topic }>())
  const dataservicesContent = ref(
    new Map<string, { slug: string; dataservice: DataserviceWithRel }>()
  )
  const datasetsContent = ref(new Map<string, DatasetV2>())

  const topicStore = useTopicStore()
  const dataserviceStore = useDataserviceStore()
  const datasetStore = useDatasetStore()

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

  const getDatasetForFactor = (factor: ResolvedFactor): DatasetV2 | null => {
    const datasetId = factor.element?.id
    if (!datasetId) return null
    return datasetsContent.value.get(datasetId) || null
  }

  /**
   * Loads the "local" topics associated to the factors via siteExtras.uri
   */
  const loadTopicsContent = () => {
    loadURIReferencedContent(
      factors,
      (uri) =>
        // match only current site url
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
    loadURIReferencedContent(
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

  /**
   * Introspects topic's datasets from data.gouv.fr:
   * - build a cache of content
   * - sync status (archived, deleted)
   * - optional callback for extra processing (e.g., QGIS)
   */
  const loadDatasetsContent = (
    onDatasetLoaded?: (dataset: DatasetV2, factor: ResolvedFactor) => void
  ) => {
    factors.value.forEach((factor) => {
      const id = factor.element?.id ?? null
      if (id && !datasetsContent.value.has(id) && !factor.remoteDeleted) {
        datasetStore
          .load(id, { toasted: false })
          .then((d) => {
            if (d) {
              datasetsContent.value.set(id, d)
              factor.remoteArchived = !!d.archived
              onDatasetLoaded?.(d, factor)
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
    })
  }

  return {
    getTopicForFactor,
    getDataserviceForFactor,
    getDatasetForFactor,
    loadTopicsContent,
    loadDataservicesContent,
    loadDatasetsContent
  }
}
