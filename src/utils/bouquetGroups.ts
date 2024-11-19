import { type ComputedRef, type Ref } from 'vue'

import type { DatasetProperties, DatasetsGroups } from '@/model/topic'

export function useGroups(datasetsProperties: Ref<DatasetProperties[]>): {
  groupedDatasets: ComputedRef
  getDatasetIndex: (
    group: string | undefined | null,
    indexInGroup: number
  ) => number
} {
  const noGroup = 'Sans regroupement'

  const groupedDatasets = computed(() => {
    const datasetsGroups: Ref<DatasetsGroups> = ref(new Map())
    // create the key for empty group

    datasetsGroups.value.set(noGroup, [])

    // Loop through the datasets and group them by the 'group' property
    datasetsProperties.value.forEach((dataset) => {
      if (dataset.group) {
        if (!datasetsGroups.value.has(dataset.group)) {
          // create the key for new a group with an empty array
          datasetsGroups.value.set(dataset.group, [])
        }
        // push the dataset to the array of its group
        datasetsGroups.value.get(dataset.group)?.push(dataset)
      } else {
        // push datasets without group to the empty key
        datasetsGroups.value.get(noGroup)?.push(dataset)
      }
    })

    return datasetsGroups.value
  })
  const getDatasetIndex = (
    group: string | undefined | null,
    indexInGroup: number
  ) => {
    // get all datasets from group
    const groupItems = groupedDatasets.value.get(group ?? noGroup)

    if (groupItems) {
      // find the right dataset index (to handle duplicates)
      const datasetIndex = datasetsProperties.value.findIndex(
        (item) => item === groupItems[indexInGroup]
      )
      return datasetIndex
    }
    return -1
  }

  return {
    groupedDatasets,
    getDatasetIndex
  }
}
