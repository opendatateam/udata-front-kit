import {
  ref,
  watch,
  computed,
  type Ref,
  type ComputedRef,
  capitalize
} from 'vue'

import type { BreadcrumbItem } from '@/model/breadcrumb'
import {
  Availability,
  type Topic,
  type TopicExtras,
  type TopicPostData,
  type DatasetProperties,
  type SiteTopicExtras
} from '@/model/topic'
import { useDatasetStore } from '@/store/DatasetStore'
import { useTopicStore } from '@/store/TopicStore'
import { useUserStore } from '@/store/UserStore'
import { useTopicsConf } from '@/utils/config'

const { topicsSlug, topicsName, topicsExtrasKey, topicsUseThemes } =
  useTopicsConf()

export const isAvailable = (availability: Availability): boolean => {
  return [Availability.LOCAL_AVAILABLE, Availability.URL_AVAILABLE].includes(
    availability
  )
}

export const updateTopicExtras = (
  topic: Topic,
  data: Partial<SiteTopicExtras>
): TopicExtras => {
  return {
    ...topic.extras,
    [topicsExtrasKey]: {
      ...topic.extras[topicsExtrasKey],
      ...data
    }
  }
}

/**
 * Build a fonctionnal v1 (POST format) topic from clone source data
 */
export const cloneTopic = (topic: Topic): TopicPostData => {
  const { id, slug, ...data } = topic
  return {
    ...data,
    private: true,
    datasets: [],
    reuses: [],
    spatial: undefined,
    owner: useUserStore().data ?? null,
    extras: updateTopicExtras(topic, {
      cloned_from: topic.id,
      datasets_properties: topic.extras[
        topicsExtrasKey
      ].datasets_properties.map((dp) => {
        return {
          ...dp,
          id: null,
          uri: null,
          availability: Availability.NOT_AVAILABLE
        }
      })
    })
  }
}

export function useBreadcrumbLinksForTopic(
  theme: Ref<string | undefined>,
  subtheme: Ref<string | undefined>,
  topic: Ref<Topic | null>,
  topicsListAll: boolean | null
): ComputedRef<BreadcrumbItem[]> {
  return computed(() => {
    const breadcrumbs = [{ to: '/', text: 'Accueil' }]
    if (topicsListAll === true) {
      breadcrumbs.push({
        to: `/${topicsSlug}`,
        text: `${capitalize(topicsName)}s`
      })
    }

    if (theme.value !== undefined && subtheme.value !== undefined) {
      breadcrumbs.push(
        { text: theme.value, to: `/${topicsSlug}/?theme=${theme.value}` },
        {
          text: subtheme.value,
          to: `/${topicsSlug}/?theme=${theme.value}&subtheme=${subtheme.value}`
        }
      )
    }

    if (topic?.value != null) {
      breadcrumbs.push({ to: '', text: topic.value.name ?? '' })
    }

    return breadcrumbs
  })
}

export function useExtras(topic: Ref<Topic | null>): {
  theme: Ref<string | undefined>
  subtheme: Ref<string | undefined>
  datasetsProperties: Ref<DatasetProperties[]>
  clonedFrom: Ref<Topic | null>
} {
  const theme: Ref<string | undefined> = ref()
  const subtheme: Ref<string | undefined> = ref()
  const datasetsProperties: Ref<DatasetProperties[]> = ref([])
  const clonedFrom = ref<Topic | null>(null)

  watch(
    topic,
    () => {
      const extras = topic.value?.extras[topicsExtrasKey]
      if (extras != null) {
        theme.value = topicsUseThemes ? extras.theme : undefined
        subtheme.value = topicsUseThemes ? extras.subtheme : undefined
        datasetsProperties.value = extras.datasets_properties ?? []
        if (extras.cloned_from != null) {
          useTopicStore()
            .load(extras.cloned_from, { toasted: false })
            .then((res) => {
              clonedFrom.value = res
            })
            .catch((err) => {
              console.error('Failed fetching cloned_from', err.response?.data)
              clonedFrom.value = null
            })
        } else {
          clonedFrom.value = null
        }
      } else {
        theme.value = undefined
        subtheme.value = undefined
        datasetsProperties.value = []
        clonedFrom.value = null
      }
    },
    { immediate: true }
  )

  return { theme, subtheme, datasetsProperties, clonedFrom }
}
