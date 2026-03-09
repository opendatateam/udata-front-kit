import type { PageFilterConf, PageFilterValueConf } from '@/model/config'
import type { FilterOption, FilterState } from '@/model/filter'
import type { QueryAsString } from '@/router/utils'
import { usePageConf } from './config'
import type { QueryArgs } from './tags'
import { useUniverseQuery } from './universe'

/**
 * Get filter configuration by filter ID
 */
export const getFilterConf = (
  pageKey: string,
  filterId: string
): PageFilterConf | undefined => {
  const pageConf = usePageConf(pageKey)
  return pageConf.filters.find((filter) => filter.id === filterId)
}

/**
 * Get filter option values, optionally filtered by parent
 */
export const getFilterOptions = (
  pageKey: string,
  filterId: string,
  parentValueId?: string
): FilterOption[] => {
  const filter = getFilterConf(pageKey, filterId)
  if (!filter) return []
  return filter.values.filter((value) => {
    if (!parentValueId) return true
    return value.parent === parentValueId
  })
}

/**
 * Parse a raw filter value string and extract the filter configuration value
 */
export const parseFilterValue = (
  filterConf: PageFilterConf,
  filterPrefixFromPage: string | null,
  rawValue: string
): PageFilterValueConf | undefined => {
  const filterPrefix = filterConf.use_filter_prefix
    ? `${filterPrefixFromPage}-${filterConf.id}-`
    : null
  if (filterPrefix && !rawValue.startsWith(filterPrefix)) return
  const value =
    filterConf.use_filter_prefix && filterPrefix
      ? rawValue.replace(filterPrefix, '')
      : rawValue
  return filterConf.values.find((v) => v.id === value)
}

/**
 * Build a filter value string with optional prefix
 */
export const useFilterValue = (
  pageKey: string,
  filterId: string,
  valueId?: string | null,
  useFilterPrefix = true
): string => {
  if (!useFilterPrefix) return valueId || ''
  const pageConf = usePageConf(pageKey)
  return `${pageConf.filter_prefix}-${filterId}-${valueId || ''}`
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
        ? getFilterOptions(pageKey, filter.childId, filter.selectedValue)
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
        : getFilterOptions(pageKey, filter.id),
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

/**
 * Build an object of API parameters grouped by parameter name from filter query args and clean the original QueryArgs
 */
export const useFiltersApiParams = (
  pageKey: string,
  query: QueryArgs,
  filterOnForm: boolean = false
): { apiParams: Record<string, Array<string>>; extraArgs: QueryArgs } => {
  const pageConf = usePageConf(pageKey)
  const filters = pageConf.filters
    .filter((item) => item.type === 'select')
    .filter((item) => !filterOnForm || item.form != null)
  const apiParams: Record<string, Array<string>> = {}
  for (const filter of filters) {
    const queryFilter = query[filter.id]
    if (queryFilter != null) {
      const apiParamName = filter.api_param || 'tag'
      const paramValue = useFilterValue(
        pageKey,
        filter.id,
        queryFilter,
        filter.use_filter_prefix || false
      )
      apiParams[apiParamName] = [...(apiParams[apiParamName] || []), paramValue]
    }
    delete query[filter.id]
  }
  return {
    apiParams,
    extraArgs: query
  }
}

/**
 * Process all page query parameters (filters, checkboxes) and merge with universe query
 * This is a convenience wrapper that combines useFiltersApiParams, useCheckboxQuery, and useUniverseQuery
 *
 * Example URL: `/bouquets?theme=mieux-consommer&organization=ademe&include_private=true&page=2`
 *
 * Processing flow:
 * 1. useFiltersApiParams extracts filter params:
 *    - `theme=mieux-consommer` → { tag: ['ecospheres-theme-mieux-consommer'] }
 *    - `organization=ademe` → { organization: ['ademe'] }
 * 2. useCheckboxQuery extracts checkbox params:
 *    - `include_private=true` → { include_private: 'true' }
 * 3. useUniverseQuery merges with universe_query from config (universe_query: { tag: 'ecospheres' }):
 *    - Merges to: { tag: ['ecospheres-theme-mieux-consommer', 'ecospheres'], organization: ['ademe'] }
 * 4. Returns merged object ready for API:
 *    - { tag: ['ecospheres-theme-mieux-consommer', 'ecospheres'], organization: ['ademe'], include_private: 'true', page: '2' }
 */
export const usePageQueryParams = (
  pageKey: string,
  queryArgs: QueryArgs,
  filterOnForm: boolean = false
) => {
  // Extract filter API params from query args
  const { extraArgs: argsAfterFiltersQuery, apiParams } = useFiltersApiParams(
    pageKey,
    queryArgs,
    filterOnForm
  )
  // Extract checkbox filters from remaining args
  const { extraArgs: refinedFilterArgs, checkboxArgs } = useCheckboxQuery(
    pageKey,
    argsAfterFiltersQuery
  )
  // Merge API params with universe query
  const mergedApiParams = useUniverseQuery(pageKey, apiParams)

  // Return everything merged into a single object
  return {
    ...mergedApiParams,
    ...checkboxArgs,
    ...refinedFilterArgs
  }
}
