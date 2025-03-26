import type { Filters } from '@/model/config'
import type { TagSelectOption } from '@/model/tag'
import type { QueryAsString } from '@/router/utils'
import { useFiltersConf } from './config'
import { getTagOptions } from './tags'

interface FilterState {
  id: string
  selectedValue: string | undefined
  options: TagSelectOption[]
  childId?: string
}

/**
 * Sets up and manages a reactive state for filters with parent-child relationships.
 *
 * This function handles the following:
 * - Initializes filter states based on route query parameters and filter configuration
 * - Manages parent-child filter relationships
 * - Updates child filter options when parent selection changes
 * - Maintains selected values across filter updates
 * - Provides reactive state management for filter selections
 * - Does NOT update the route query parameters; that is the responsibility of the caller
 *
 * Also provides filtersConf for convenience.
 */
export const useFiltersState = (
  routeQuery: QueryAsString,
  objectType: Filters
) => {
  const filtersConf = useFiltersConf(objectType)
  const filtersState = reactive<Record<string, FilterState>>({})

  const setChildOptions = (
    filter: FilterState,
    childSelectedValue?: string
  ) => {
    if (filter.childId) {
      // Update child filter's options based on parent selection
      const childFilter = filtersState[filter.childId]
      childFilter.options = filter.selectedValue
        ? getTagOptions(objectType, filter.childId, filter.selectedValue)
        : []
      // Clear child selection when parent changes or set to initial value
      childFilter.selectedValue = childSelectedValue
    }
  }

  // Initialize the filters structure
  const withParent = filtersConf.items.map((filter) => filter.child)
  filtersConf.items.forEach((filter) => {
    filtersState[filter.id] = {
      id: filter.id,
      selectedValue: routeQuery[filter.id] || undefined,
      options: withParent.includes(filter.id)
        ? []
        : getTagOptions(objectType, filter.id),
      childId: filter.child
    }
  })

  Object.values(filtersState).forEach((filter) => {
    if (filter.childId) {
      // initial set of child options, with current query param if any
      setChildOptions(filter, routeQuery[filter.childId] || undefined)
      // Watch parent filter changes to update their children later in lifecycle
      watch(
        () => filter.selectedValue,
        () => {
          setChildOptions(filter)
        }
      )
    }
  })

  return { filtersState, filtersConf }
}
