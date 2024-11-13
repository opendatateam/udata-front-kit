import {
  capitalize,
  computed,
  ref,
  watch,
  type ComputedRef,
  type Ref
} from 'vue'

import type { BreadcrumbItem } from '@/model/breadcrumb'
import {
  Availability,
  type DatasetProperties,
  type DatasetsGroups,
  type SiteTopicExtras,
  type Topic,
  type TopicExtras,
  type TopicPostData
} from '@/model/topic'
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
  // datasetsGroups: Ref<DatasetsGroups>
  groupedDatasets: ComputedRef
  clonedFrom: Ref<Topic | null>
  updateGroup: (
    datasetToUpdate: DatasetProperties,
    newGroup: string | undefined
  ) => void
} {
  const theme: Ref<string | undefined> = ref()
  const subtheme: Ref<string | undefined> = ref()
  const datasetsProperties: Ref<DatasetProperties[]> = ref([])
  // const datasetsGroups: Ref<DatasetsGroups> = ref(new Map())
  const clonedFrom = ref<Topic | null>(null)

  watch(
    topic,
    async () => {
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

  // Create a Map to store datasets grouped by their group
  const groupedDatasets = computed(() => {
    const datasetsGroups: Ref<DatasetsGroups> = ref(new Map())

    // Loop through the datasets and group them by the 'group' property
    datasetsProperties.value.forEach((dataset) => {
      if (!dataset.group) {
        dataset.group = 'Sans regroupement' // Default group
      }

      if (!datasetsGroups.value.has(dataset.group)) {
        datasetsGroups.value.set(dataset.group, [])
      }

      datasetsGroups.value.get(dataset.group)?.push(dataset)
    })

    return datasetsGroups.value
  })

  // Method to update the group of a specific dataset
  const updateGroup = (
    datasetToUpdate: DatasetProperties,
    newGroup: string | undefined
  ) => {
    datasetToUpdate.group = newGroup || 'Sans regroupement'
  }

  return {
    theme,
    subtheme,
    datasetsProperties,
    clonedFrom,
    groupedDatasets,
    updateGroup
  }
}
