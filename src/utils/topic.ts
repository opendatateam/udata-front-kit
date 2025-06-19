import { ref, watch, type Ref } from 'vue'

import {
  Availability,
  ResolvedDatasetElement,
  type Topic,
  type TopicPostData
} from '@/model/topic'
import { useTopicElementStore } from '@/store/TopicElementStore'
import { useTopicStore } from '@/store/TopicStore'
import { useUserStore } from '@/store/UserStore'
import { useSiteId } from '@/utils/config'

const topicsExtrasKey = useSiteId()

// TODO: move to ResolvedDatasetElement class
export const isAvailable = (availability: Availability): boolean => {
  return [Availability.LOCAL_AVAILABLE, Availability.URL_AVAILABLE].includes(
    availability
  )
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
    await useTopicElementStore().getTopicElements({ topicId: topic.id })
  ).map((element) => {
    if (!keepDatasets) {
      element.element = null
      element.extras[topicsExtrasKey].uri = null
      element.extras[topicsExtrasKey].availability = Availability.NOT_AVAILABLE
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
      [topicsExtrasKey]: {
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
  elements: Ref<ResolvedDatasetElement[]>
  nbElements: Ref<number>
} {
  const nbElements: Ref<number> = ref(0)
  const elements: Ref<ResolvedDatasetElement[]> = ref([])

  watch(
    topic,
    async () => {
      if (!topic.value) return
      const rawElements = await useTopicElementStore().getTopicElements({
        topicId: topic.value.id
      })
      elements.value = rawElements.map(
        (element) => new ResolvedDatasetElement(element, useSiteId())
      )
      nbElements.value = elements.value.length
    },
    { immediate: true }
  )

  return { elements, nbElements }
}
