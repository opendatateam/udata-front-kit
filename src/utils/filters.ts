import type { TagSelectOption } from '@/model/tag'
import type { QueryAsString } from '@/router/utils'
import { usePageConf } from './config'
import { getTagOptions } from './tags'

export interface FilterState {
  id: string
  selectedValue: string | null
  options: TagSelectOption[]
  childId: string | null
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
 * Also provides pageConf for convenience.
 */
export const useFiltersState = (
  routeQuery: QueryAsString,
  pageKey: string,
  filterOnForm: boolean = false
) => {
  const pageConf = usePageConf(pageKey)
  const filtersState = reactive<Record<string, FilterState>>({})
  const filterItems = pageConf.filters
    .filter((item) => item.type === 'select' || item.type === 'checkbox')
    .filter((item) => !filterOnForm || item.form != null)

  const setChildOptions = (
    filter: FilterState,
    childSelectedValue?: string
  ) => {
    if (filter.childId) {
      // Update child filter's options based on parent selection
      const childFilter = filtersState[filter.childId]
      childFilter.options = filter.selectedValue
        ? getTagOptions(pageKey, filter.childId, filter.selectedValue)
        : []
      // Clear child selection when parent changes or set to initial value
      childFilter.selectedValue = childSelectedValue || null
    }
  }

  // Initialize the filters structure
  const withParent = filterItems.map((filter) => filter.child)
  filterItems.forEach((filter) => {
    filtersState[filter.id] = {
      id: filter.id,
      selectedValue: routeQuery[filter.id] || null,
      options: withParent.includes(filter.id)
        ? []
        : getTagOptions(pageKey, filter.id),
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

  return { filtersState, pageConf }
}

/**
 * Extract checkbox filters as defined in conf from query args and return them as a separate object
 */
export const useCheckboxQuery = (
  pageKey: string,
  queryArgs: Record<string, string | null | undefined>
) => {
  const pageConf = usePageConf(pageKey)
  const filters = pageConf.filters.filter((item) => item.type === 'checkbox')
  const checkboxArgs: Record<string, string> = {}
  for (const filter of filters) {
    if (filter.type === 'checkbox') {
      const queryFilter = queryArgs[filter.id]
      // include the filter if it's true or if it's not in the query and the default is true
      if (
        queryFilter === 'true' ||
        (queryFilter == null && filter.default_value === true)
      ) {
        checkboxArgs[filter.id] = 'true'
      }
      delete queryArgs[filter.id]
    }
  }
  return {
    checkboxArgs,
    extraArgs: queryArgs
  }
}
