import { ref, watch, type Ref } from 'vue'

import {
  Availability,
  type DatasetElement,
  type SiteTopicExtras,
  type Topic,
  type TopicExtras,
  type TopicPostData
} from '@/model/topic'
import { useTopicElementStore } from '@/store/TopicElementStore'
import { useTopicStore } from '@/store/TopicStore'
import { useUserStore } from '@/store/UserStore'
import { useSiteId } from '@/utils/config'

const topicsExtrasKey = useSiteId()

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
export const cloneTopic = async (
  topic: Topic,
  keepDatasets: boolean = false
): Promise<TopicPostData> => {
  const { id, slug, ...data } = topic

  const elements = (
    await useTopicElementStore().getTopicElements(topic.id)
  ).map((element) => {
    if (!keepDatasets) {
      element.element = {}
      element.extras[useSiteId()].uri = null
      element.extras[useSiteId()].availability = Availability.NOT_AVAILABLE
    }
    return element
  })

  return {
    ...data,
    private: true,
    spatial: undefined,
    owner: useUserStore().data ?? null,
    organization: null,
    elements,
    extras: updateTopicExtras(topic, {
      cloned_from: topic.id
    })
  }
}

export function useExtras(topic: Ref<Topic | null | undefined>): {
  clonedFrom: Ref<Topic | null>
} {
  const clonedFrom = ref<Topic | null>(null)

  watch(
    topic,
    () => {
      const extras = topic.value?.extras[topicsExtrasKey]
      if (extras?.cloned_from != null) {
        useTopicStore()
          .load(extras.cloned_from, { toasted: false })
          .then((res) => {
            clonedFrom.value = res
          })
          .catch((err) => {
            console.error('Failed fetching cloned_from', err.response?.data)
            clonedFrom.value = null
          })
      }
    },
    { immediate: true }
  )

  return { clonedFrom }
}

export function useTopicElements(topic: Ref<Topic | null | undefined>): {
  elements: Ref<DatasetElement[]>
  nbElements: Ref<number>
} {
  const nbElements: Ref<number> = ref(0)
  const elements: Ref<DatasetElement[]> = ref([])

  watch(
    topic,
    async () => {
      if (!topic.value) return
      nbElements.value = topic.value.elements.total || 0
      elements.value = await useTopicElementStore().getTopicElements(
        topic.value.id
      )
    },
    { immediate: true }
  )

  return { elements, nbElements }
}
