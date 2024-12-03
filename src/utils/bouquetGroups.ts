import { type ComputedRef, type Ref } from 'vue'

import type { DatasetProperties, DatasetsGroups } from '@/model/topic'

export const noGroup = 'Sans regroupement'

export function useGroups(datasetsProperties: Ref<DatasetProperties[]>): {
  groupedDatasets: ComputedRef
  getDatasetIndex: (group: string, indexInGroup: number) => number
  removeDatasetFromGroup: (group: string, index: number) => DatasetProperties[]
  groupAlreadyExists: (groupName: string) => boolean
  renameGroup: (oldGroupName: string, newGroupName: string) => void
  deleteGroup: (groupName: string) => DatasetProperties[]
} {
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

    // get all entries within nogroup if any exists
    const noGroupEntries: DatasetProperties[] | undefined =
      datasetsGroups.value.has(noGroup)
        ? datasetsGroups.value.get(noGroup)
        : undefined

    // create a new Map without nogroup
    const filteredGroups: DatasetsGroups = new Map(
      [...datasetsGroups.value].filter(([key]) => key !== noGroup)
    )

    // Alphabetically sort the keys with nogroup at the end
    const sortedEntries = Array.from(filteredGroups.entries()).sort(
      ([keyA], [keyB]) => {
        return keyA.toString().localeCompare(keyB.toString())
      }
    )

    // Add the nogroup to the end of the sorted array
    if (noGroupEntries) {
      sortedEntries.push([noGroup, noGroupEntries])
    }

    return new Map(sortedEntries)
  })
  const getDatasetIndex = (group: string, indexInGroup: number) => {
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

  const removeDatasetFromGroup = (group: string, index: number) => {
    if (
      window.confirm(`Etes-vous sûr de vouloir supprimer ce jeu de données ?`)
    ) {
      const datasetToDeleteIndex = getDatasetIndex(group, index)

      if (datasetToDeleteIndex !== -1) {
        return datasetsProperties.value.splice(datasetToDeleteIndex, 1)
      }
    }
    return datasetsProperties.value
  }

  const groupAlreadyExists = (groupName: string) => {
    return groupedDatasets.value.has(groupName)
  }

  const renameGroup = (oldGroupName: string, newGroupName: string) => {
    const errors: Ref<string[]> = ref([])
    // get all datasets from the old group in groupedDatasets
    const oldGroupItems = groupedDatasets.value.get(oldGroupName ?? null)

    if (!groupAlreadyExists(newGroupName) && oldGroupItems) {
      // find the datasets with the old group property in datasetsProperties
      const matchingDatasets = datasetsProperties.value.filter((dataset) => {
        return oldGroupItems.some(
          (groupItem) =>
            groupItem.title === dataset.title &&
            groupItem.group === dataset.group
        )
      })
      if (matchingDatasets) {
        // update the group property to the new group
        matchingDatasets.forEach((dataset) => (dataset.group = newGroupName))
      }
    }
    return errors
  }

  const deleteGroup = (groupName: string) => {
    // get all datasets from the old group in groupedDatasets
    const groupItems = groupedDatasets.value.get(groupName ?? null)

    if (groupItems) {
      // exclude the items of the group to delete from datasetsProperties
      const updatedDatasetsProperties = datasetsProperties.value.filter(
        (dataset) => {
          return groupItems.find(
            (groupItem) =>
              groupItem.title !== dataset.title &&
              groupItem.group !== dataset.group
          )
        }
      )
      return updatedDatasetsProperties
    }

    return datasetsProperties.value
  }

  return {
    groupedDatasets,
    getDatasetIndex,
    removeDatasetFromGroup,
    groupAlreadyExists,
    renameGroup,
    deleteGroup
  }
}
