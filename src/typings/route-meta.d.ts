import 'vue-router'
import type { GlobalSearchConfig } from '@datagouv/components-next'
import type { PageObjectType } from '@/model/config'
import type { CustomFilterConfig } from '@/router/utils'

// To ensure it is treated as a module, add at least one `export` statement
export {}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    cardComponent?: () => Promise<{ default: Component }>
    datasetCardComponent?: () => Promise<{ default: Component }>
    descriptionComponent?: () => Promise<{ default: Component }>
    pageKey?: string
    // Detail page's object type (e.g. to scope behaviour to dataset detail pages,
    // regardless of pageKey - datasets, indicators, ...)
    objectType?: PageObjectType
    // GlobalSearch-specific
    searchType?: PageObjectType
    searchConfig?: GlobalSearchConfig
    customFilters?: CustomFilterConfig[]
  }
}
