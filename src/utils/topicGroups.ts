import { useDebounceFn } from '@vueuse/core'
import { type ComputedRef, type Ref, ref } from 'vue'

import type { DatasetElement, ElementsGroups } from '@/model/topic'
import { useSiteId } from '@/utils/config'
import { updateTopicElementExtras } from './topic'

import { debounceWait } from '@/utils/config'

export const NO_GROUP = 'Sans regroupement'

export const isOnlyNoGroup = (groups: ElementsGroups) => {
  return groups.has(NO_GROUP) && groups.size === 1
}

export function useGroups(elements: Ref<DatasetElement[]>): {
  groupedElements: ComputedRef<ElementsGroups>
  getElementIndex: (group: string, indexInGroup: number) => number
  removeElementFromGroup: (group: string, index: number) => DatasetElement[]
  groupExists: (groupName: string) => boolean
  renameGroup: (oldGroupName: string, newGroupName: string) => DatasetElement[]
  deleteGroup: (groupName: string) => DatasetElement[]
} {
  const groupedElements = computed(() => {
    // Group datasets by their group property
    const groupedMap = elements.value.reduce((acc, element) => {
      const groupKey = element.extras[useSiteId()]?.group || NO_GROUP
      if (!acc.has(groupKey)) {
        acc.set(groupKey, [])
      }
      acc.get(groupKey)?.push(element)
      return acc
    }, new Map<string, DatasetElement[]>())

    // Sort each group's datasets by lowered+unaccented title according to current locale
    for (const [, elements] of groupedMap.entries()) {
      elements.sort((a, b) =>
        // some legacy datasets have no title, fallback to '' to avoid errors
        (a.title || '').localeCompare(b.title || '', undefined, {
          sensitivity: 'base'
        })
      )
    }

    // Extract and remove NO_GROUP entries
    const noGroupEntries = groupedMap.get(NO_GROUP)
    groupedMap.delete(NO_GROUP)

    // Sort groups alphabetically
    const sortedEntries = Array.from(groupedMap.entries()).sort(
      ([keyA], [keyB]) => keyA.localeCompare(keyB)
    )

    // Add noGroup entries at the end if they exist
    if (noGroupEntries?.length) {
      sortedEntries.push([NO_GROUP, noGroupEntries])
    }

    return new Map(sortedEntries)
  })
  const getElementIndex = (group: string, indexInGroup: number) => {
    // get all datasets from group
    const groupItems = groupedElements.value.get(group ?? NO_GROUP)

    if (groupItems) {
      // find the right dataset index (to handle duplicates)
      const datasetIndex = elements.value.findIndex(
        (item) => item === groupItems[indexInGroup]
      )
      return datasetIndex
    }
    return -1
  }

  const removeElementFromGroup = (group: string, index: number) => {
    const datasetToDeleteIndex = getElementIndex(group, index)

    if (datasetToDeleteIndex === -1) {
      return elements.value
    }

    const confirmMessage =
      'Etes-vous sûr de vouloir supprimer ce jeu de données ?'
    if (!window.confirm(confirmMessage)) {
      return elements.value
    }

    return elements.value.filter((_, index) => index !== datasetToDeleteIndex)
  }

  const groupExists = (groupName: string) => {
    return groupedElements.value.has(groupName)
  }

  const renameGroup = (oldGroupName: string, newGroupName: string) => {
    // Skip if new group already exists or old group is empty
    if (groupExists(newGroupName) || !groupedElements.value.has(oldGroupName)) {
      return elements.value
    }
    const data = elements.value.map((element) =>
      element.extras[useSiteId()]?.group === oldGroupName
        ? {
            ...element,
            extras: updateTopicElementExtras(element, { group: newGroupName })
          }
        : element
    )
    return data
  }

  const deleteGroup = (groupName: string) => {
    return elements.value.filter(
      (element) => element.extras[useSiteId()]?.group !== groupName
    )
  }

  return {
    groupedElements,
    getElementIndex,
    removeElementFromGroup,
    groupExists,
    renameGroup,
    deleteGroup
  }
}

export function useElementsFilter(elements: Ref<DatasetElement[]>) {
  const searchQuery = ref('')
  const isFiltering = computed(() => !!searchQuery.value)

  // TODO: move this to API elements q=
  // add a property to hide the datasets on filtering
  const filteredElements = computed(() => {
    if (!searchQuery.value) return elements.value

    const searchValue = searchQuery.value.toLowerCase()

    return elements.value.map((element) => ({
      ...element,
      isHidden: !(
        element.title.toLowerCase().includes(searchValue) ||
        (element.description &&
          element.description.toLowerCase().includes(searchValue))
      )
    }))
  })

  // Check if all groups only contain hidden datasets
  const isAllGroupsHidden = computed(() => {
    return filteredElements.value.every((element) => element.isHidden)
  })

  // Check if a specific group only contains hidden datasets
  const isGroupOnlyHidden = (groupName: string) => {
    const filterGroupName = groupName === NO_GROUP ? null : groupName
    return filteredElements.value
      .filter(
        (element) => element.extras[useSiteId()]?.group === filterGroupName
      )
      .every((element) => element.isHidden)
  }

  // apply search query
  const filterElements = useDebounceFn((value: string) => {
    searchQuery.value = value
  }, debounceWait)

  return {
    isFiltering,
    filterElements,
    filteredElements,
    isAllGroupsHidden,
    isGroupOnlyHidden
  }
}
