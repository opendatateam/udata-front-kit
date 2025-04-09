import { ref, watch, type Ref } from 'vue'

import {
  Availability,
  type DatasetProperties,
  type SiteTopicExtras,
  type Topic,
  type TopicExtras,
  type TopicPostData
} from '@/model/topic'
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
export const cloneTopic = (
  topic: Topic,
  keepDatasets: boolean = false
): TopicPostData => {
  const { id, slug, ...data } = topic

  // get a deduplicated list of dataset ids from factors that point to a dataset
  const getDatasetsIds = () => {
    return [
      ...new Set(
        topic.extras[topicsExtrasKey].datasets_properties
          .map((dp) => dp.id)
          .filter((id) => id != null)
      )
    ]
  }

  return {
    ...data,
    private: true,
    datasets: keepDatasets ? getDatasetsIds() : [],
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
          id: keepDatasets ? dp.id : null,
          uri: keepDatasets ? dp.uri : null,
          availability: keepDatasets
            ? dp.availability
            : Availability.NOT_AVAILABLE
        }
      })
    })
  }
}

export function useExtras(topic: Ref<Topic | null | undefined>): {
  datasetsProperties: Ref<DatasetProperties[]>
  clonedFrom: Ref<Topic | null>
} {
  const datasetsProperties: Ref<DatasetProperties[]> = ref([])
  const clonedFrom = ref<Topic | null>(null)

  watch(
    topic,
    () => {
      const extras = topic.value?.extras[topicsExtrasKey]
      if (extras != null) {
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
        datasetsProperties.value = []
        clonedFrom.value = null
      }
    },
    { immediate: true }
  )

  return { datasetsProperties, clonedFrom }
}
