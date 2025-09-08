import { useDebounceFn } from '@vueuse/core'
import { type ComputedRef, type Ref, ref } from 'vue'

import type { FactorsGroups, ResolvedFactor } from '@/model/topic'

import { debounceWait } from '@/utils/config'

export const NO_GROUP = 'Sans regroupement'

export const isOnlyNoGroup = (groups: FactorsGroups) => {
  return groups.has(NO_GROUP) && groups.size === 1
}

export function useGroups(factors: Ref<ResolvedFactor[]>): {
  groupedFactors: ComputedRef<FactorsGroups>
  getFactorIndex: (group: string, indexInGroup: number) => number
  removeFactorFromGroup: (group: string, index: number) => ResolvedFactor[]
  groupExists: (groupName: string) => boolean
  renameGroup: (oldGroupName: string, newGroupName: string) => ResolvedFactor[]
  deleteGroup: (groupName: string) => ResolvedFactor[]
} {
  const groupedFactors = computed(() => {
    // Group datasets by their group property
    const groupedMap = factors.value.reduce((acc, factor) => {
      const groupKey = factor.siteExtras.group || NO_GROUP
      if (!acc.has(groupKey)) {
        acc.set(groupKey, [])
      }
      acc.get(groupKey)?.push(factor)
      return acc
    }, new Map<string, ResolvedFactor[]>())

    // Sort each group's factors by lowered+unaccented title according to current locale
    for (const [, factors] of groupedMap.entries()) {
      factors.sort((a, b) =>
        // some legacy factors have no title, fallback to '' to avoid errors
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
  const getFactorIndex = (group: string, indexInGroup: number) => {
    // get all datasets from group
    const groupItems = groupedFactors.value.get(group ?? NO_GROUP)

    if (groupItems) {
      // find the right dataset index (to handle duplicates)
      const datasetIndex = factors.value.findIndex(
        (item) => item === groupItems[indexInGroup]
      )
      return datasetIndex
    }
    return -1
  }

  const removeFactorFromGroup = (group: string, index: number) => {
    const factorToDeleteIndex = getFactorIndex(group, index)

    if (factorToDeleteIndex === -1) {
      return factors.value
    }

    const confirmMessage =
      'Etes-vous sûr de vouloir supprimer ce jeu de données ?'
    if (!window.confirm(confirmMessage)) {
      return factors.value
    }

    return factors.value.filter((_, index) => index !== factorToDeleteIndex)
  }

  const groupExists = (groupName: string) => {
    return groupedFactors.value.has(groupName)
  }

  const renameGroup = (oldGroupName: string, newGroupName: string) => {
    // Skip if new group already exists or old group is empty
    if (groupExists(newGroupName) || !groupedFactors.value.has(oldGroupName)) {
      return factors.value
    }
    const data = factors.value.map((factor) => {
      if (factor.siteExtras.group === oldGroupName) {
        factor.siteExtras.group = newGroupName
      }
      return factor
    })
    return data
  }

  const deleteGroup = (groupName: string) => {
    return factors.value.filter(
      (factor) => factor.siteExtras.group !== groupName
    )
  }

  return {
    groupedFactors,
    getFactorIndex,
    removeFactorFromGroup,
    groupExists,
    renameGroup,
    deleteGroup
  }
}

export function useFactorsFilter(factors: Ref<ResolvedFactor[]>) {
  const searchQuery = ref('')
  const isFiltering = computed(() => !!searchQuery.value)

  // TODO: move this to API elements q=
  // add a property to hide the datasets on filtering
  const filteredFactors = computed(() => {
    if (!searchQuery.value) return factors.value

    const searchValue = searchQuery.value.toLowerCase()

    return factors.value.map((factor) => {
      factor.isHidden = !(
        factor.title.toLowerCase().includes(searchValue) ||
        (factor.description &&
          factor.description.toLowerCase().includes(searchValue))
      )
      return factor
    })
  })

  // Check if all groups only contain hidden datasets
  const isAllGroupsHidden = computed(() => {
    return filteredFactors.value.every((factor) => factor.isHidden)
  })

  // Check if a specific group only contains hidden datasets
  const isGroupOnlyHidden = (groupName: string) => {
    const filterGroupName = groupName === NO_GROUP ? null : groupName
    return filteredFactors.value
      .filter((factor) => factor.siteExtras.group === filterGroupName)
      .every((factor) => factor.isHidden)
  }

  // apply search query
  const filterFactors = useDebounceFn((value: string) => {
    searchQuery.value = value
  }, debounceWait)

  return {
    isFiltering,
    filterFactors,
    filteredFactors,
    isAllGroupsHidden,
    isGroupOnlyHidden
  }
}
