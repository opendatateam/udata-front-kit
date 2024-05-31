import { ref, watch, computed, type Ref, type ComputedRef } from 'vue'

import type { BreadcrumbItem } from '@/model/breadcrumb'
import {
  Availability,
  type Topic,
  type EcospheresTopicExtras,
  type TopicExtras,
  type TopicPostData,
  type DatasetProperties
} from '@/model/topic'
import { useTopicStore } from '@/store/TopicStore'
import { useUserStore } from '@/store/UserStore'

export const isAvailable = (availability: Availability): boolean => {
  return [Availability.LOCAL_AVAILABLE, Availability.URL_AVAILABLE].includes(
    availability
  )
}

export const updateExtras = (
  topic: Topic,
  data: Partial<EcospheresTopicExtras>
): TopicExtras => {
  return {
    ...topic.extras,
    ecospheres: {
      ...topic.extras.ecospheres,
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
    owner: useUserStore().data ?? null,
    extras: {
      ...updateExtras(topic, { cloned_from: topic.id }),
      // FIXME: move to updateExtras logic when extras are migrated to new schema
      'ecospheres:datasets_properties': topic.extras[
        'ecospheres:datasets_properties'
      ].map((dp) => {
        return {
          ...dp,
          id: null,
          uri: null,
          availability: Availability.NOT_AVAILABLE
        }
      })
    },
    spatial: undefined
  }
}

export function useBreadcrumbLinksForTopic(
  theme: Ref<string | undefined>,
  subtheme: Ref<string | undefined>,
  topic: Ref<Topic | null>
): ComputedRef<BreadcrumbItem[]> {
  return computed(() => {
    const breadcrumbs = [
      { to: '/', text: 'Accueil' },
      { to: { name: 'bouquets' }, text: 'Bouquets' }
    ]

    if (theme.value !== undefined && subtheme.value !== undefined) {
      breadcrumbs.push(
        { text: theme.value, to: `/bouquets/?theme=${theme.value}` },
        {
          text: subtheme.value,
          to: `/bouquets/?theme=${theme.value}&subtheme=${subtheme.value}`
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

  watch(topic, () => {
    theme.value = topic.value?.extras['ecospheres:informations'][0].theme
    subtheme.value = topic.value?.extras['ecospheres:informations'][0].subtheme
    datasetsProperties.value =
      topic.value?.extras['ecospheres:datasets_properties'] ?? []
    // FIXME: catch 404 when possible from data.gouv.fr
    if (topic.value?.extras?.ecospheres?.cloned_from != null) {
      useTopicStore()
        .load(topic.value?.extras.ecospheres.cloned_from)
        .then((res) => {
          clonedFrom.value = res
        })
        .catch(() => {
          clonedFrom.value = null
        })
    } else {
      clonedFrom.value = null
    }
  })

  return { theme, subtheme, datasetsProperties, clonedFrom }
}
