import 'vue-router'
import type { GlobalSearchConfig } from '@datagouv/components-next'
import type { PageObjectType } from '@/model/config'

// To ensure it is treated as a module, add at least one `export` statement
export {}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    filtersComponent?: () => Promise<{ default: Component }>
    cardComponent?: () => Promise<{ default: Component }>
    datasetCardComponent?: () => Promise<{ default: Component }>
    listComponent?: () => Promise<{ default: Component }>
    descriptionComponent?: () => Promise<{ default: Component }>
    cardClass?: string
    pageKey?: string
    // GlobalSearch-specific
    searchType?: PageObjectType
    searchConfig?: GlobalSearchConfig
  }
}
