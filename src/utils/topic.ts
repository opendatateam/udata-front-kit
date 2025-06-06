import { ref, watch, type Ref } from 'vue'

import {
  Availability,
  type DatasetElement,
  type ElementExtras,
  type SiteElementExtras,
  type Topic,
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

export const updateTopicElementExtras = (
  element: DatasetElement,
  data: Partial<SiteElementExtras>
): ElementExtras => {
  return {
    ...element.extras,
    [topicsExtrasKey]: {
      ...element.extras[topicsExtrasKey],
      ...data
    }
  }
}

/**
 * Build a fonctionnal Topic from clone source data
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
    // we're not copying all the extras over, only the ones we control
    extras: {
      [useSiteId()]: {
        cloned_from: topic.id
      }
    }
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
