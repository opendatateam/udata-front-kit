import { type ComputedRef, type Ref } from 'vue'

import type { DatasetProperties, DatasetsGroups } from '@/model/topic'

export function useGroups(datasetsProperties: Ref<DatasetProperties[]>): {
  groupedDatasets: ComputedRef
  deleteEmptyGroups: () => void
} {
  const groupedDatasets = computed(() => {
    const datasetsGroups: Ref<DatasetsGroups> = ref(new Map())
    // create the key for empty group
    const noGroup = 'Sans regroupement'
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

  const deleteEmptyGroups = () => {
    // check for empty groups and delete them
    for (const [key, value] of groupedDatasets.value) {
      if (value.length === 0) {
        groupedDatasets.value.delete(key)
      }
    }
  }

  return {
    groupedDatasets,
    deleteEmptyGroups
  }
}
