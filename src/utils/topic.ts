import { ref, watch, type Ref } from 'vue'

import {
  Availability,
  ResolvedFactor,
  type Factor,
  type Topic,
  type TopicPostData
} from '@/model/topic'
import { useTopicElementStore } from '@/store/TopicElementStore'
import { useTopicStore } from '@/store/TopicStore'
import { useUserStore } from '@/store/UserStore'
import { useSiteId } from '@/utils/config'

const topicsExtrasKey = useSiteId()

// TODO: move to ResolvedFactor class
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

  const factors = (
    await useTopicElementStore().getTopicElements<Factor>({ topicId: topic.id })
  ).map((factor) => {
    if (!keepDatasets) {
      factor.element = null
      factor.extras[topicsExtrasKey].uri = null
      factor.extras[topicsExtrasKey].availability = Availability.NOT_AVAILABLE
    }
    return factor
  })

  return {
    ...data,
    private: true,
    spatial: undefined,
    owner: useUserStore().data ?? null,
    organization: null,
    elements: factors,
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

export function useTopicFactors(topic: Ref<Topic | null | undefined>): {
  factors: Ref<ResolvedFactor[]>
  nbFactors: Ref<number>
} {
  const nbFactors: Ref<number> = ref(0)
  const factors: Ref<ResolvedFactor[]> = ref([])

  watch(
    topic,
    async () => {
      if (!topic.value) return
      const rawFactors =
        topic.value.elements.total > 0
          ? await useTopicElementStore().getTopicElements<Factor>({
              topicId: topic.value.id
            })
          : []
      factors.value = rawFactors.map(
        (element) => new ResolvedFactor(element, useSiteId())
      )
      nbFactors.value = factors.value.length
    },
    { immediate: true }
  )

  return { factors, nbFactors }
}
