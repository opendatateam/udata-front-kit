import { ref, watch, computed, type Ref, type ComputedRef } from 'vue'

import config from '@/config'
import type { BreadcrumbItem } from '@/model/breadcrumb'
import {
  Availability,
  type Topic,
  type TopicExtras,
  type TopicPostData,
  type DatasetProperties,
  type TopicExtrasToProcess
} from '@/model/topic'
import { useTopicStore } from '@/store/TopicStore'
import { useUserStore } from '@/store/UserStore'

const topicSlug = config.website.topics.topicName.slug
const topicName = config.website.topics.topicName.name

export const isAvailable = (availability: Availability): boolean => {
  return [Availability.LOCAL_AVAILABLE, Availability.URL_AVAILABLE].includes(
    availability
  )
}

export const updateTopicPropertiesExtras = (
  topic: Topic,
  data: Partial<TopicExtrasToProcess>,
  extrasToProcess: string
): TopicExtras => {
  return {
    ...topic.extras,
    [extrasToProcess]: {
      ...topic.extras[extrasToProcess],
      ...data
    }
  }
}

/**
 * Build a fonctionnal v1 (POST format) topic from clone source data
 */
export const cloneTopic = (
  topic: Topic,
  extrasToProcess: Ref<string>
): TopicPostData => {
  const { id, slug, ...data } = topic
  return {
    ...data,
    private: true,
    datasets: [],
    reuses: [],
    spatial: undefined,
    owner: useUserStore().data ?? null,
    extras: updateTopicPropertiesExtras(
      topic,
      {
        cloned_from: topic.id,
        datasets_properties: topic.extras[
          extrasToProcess.value
        ].datasets_properties.map((dp) => {
          return {
            ...dp,
            id: null,
            uri: null,
            availability: Availability.NOT_AVAILABLE
          }
        })
      },
      extrasToProcess.value
    )
  }
}

export function useBreadcrumbLinksForTopic(
  theme: Ref<string | undefined>,
  subtheme: Ref<string | undefined>,
  topic: Ref<Topic | null>,
  pageAllTopics: Ref<Boolean | null>
): ComputedRef<BreadcrumbItem[]> {
  return computed(() => {
    const breadcrumbs = [{ to: '/', text: 'Accueil' }]
    if (pageAllTopics) {
      breadcrumbs.push({ to: { name: topicSlug }, text: `${topicName}s` })
    }

    if (theme.value !== undefined && subtheme.value !== undefined) {
      breadcrumbs.push(
        { text: theme.value, to: `/${topicSlug}/?theme=${theme.value}` },
        {
          text: subtheme.value,
          to: `/${topicSlug}/?theme=${theme.value}&subtheme=${subtheme.value}`
        }
      )
    }

    if (topic?.value != null) {
      breadcrumbs.push({ to: '', text: topic.value.name ?? '' })
    }

    return breadcrumbs
  })
}

export function useExtras(
  topic: Ref<Topic | null>,
  extrasProperty: Ref<string>
): {
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
    [topic, extrasProperty],
    () => {
      const extras = topic.value?.extras[extrasProperty.value]
      if (extras) {
        theme.value = extras.theme
        subtheme.value = extras.subtheme
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
