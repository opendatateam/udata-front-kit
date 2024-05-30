import { ref, watch, computed, type Ref, type ComputedRef } from 'vue'

import type { BreadcrumbItem } from '@/model/breadcrumb'
import {
  Availability,
  type Topic,
  type EcospheresTopicExtras,
  type TopicExtras,
  type TopicPostData
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

export function useClonedFrom(topic: Ref<Topic | null>): Ref<Topic | null> {
  const clonedFrom = ref<Topic | null>(null)

  watch(
    topic,
    async (newTopic) => {
      // FIXME: catch 404 when possible from data.gouv.fr
      if (newTopic?.extras?.ecospheres?.cloned_from != null) {
        useTopicStore()
          .load(newTopic.extras.ecospheres.cloned_from)
          .then((res) => {
            clonedFrom.value = res
          })
          .catch(() => {
            clonedFrom.value = null
          })
      } else {
        clonedFrom.value = null
      }
    },
    { immediate: true }
  )

  return clonedFrom
}

export function useBreadcrumbLinks(
  topic: Ref<Topic | null>
): ComputedRef<BreadcrumbItem[]> {
  return computed(() => {
    const breadcrumbs = [
      { to: '/', text: 'Accueil' },
      { to: { name: 'bouquets' }, text: 'Bouquets' }
    ]

    const theme = topic.value?.extras['ecospheres:informations'][0].theme
    const subtheme = topic.value?.extras['ecospheres:informations'][0].subtheme

    if (theme !== undefined && subtheme !== undefined) {
      breadcrumbs.push(
        { text: theme, to: `/bouquets/?theme=${theme}` },
        {
          text: subtheme,
          to: `/bouquets/?theme=${theme}&subtheme=${subtheme}`
        },
        { to: '', text: topic.value?.name ?? '' }
      )
    }

    return breadcrumbs
  })
}
