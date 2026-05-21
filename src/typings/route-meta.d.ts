import 'vue-router'
import type { GlobalSearchConfig } from '@datagouv/components-next'
import type { PageObjectType } from '@/model/config'
import type { CustomFilterConfig } from '@/router/utils'

// To ensure it is treated as a module, add at least one `export` statement
export {}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    // FIXME: this are only used by StaticPage, find another way to inject from config
    metaDescription?: string
    requiresAuth?: boolean
    cardComponent?: () => Promise<{ default: Component }>
    datasetCardComponent?: () => Promise<{ default: Component }>
    descriptionComponent?: () => Promise<{ default: Component }>
    pageKey?: string
    // GlobalSearch-specific
    searchType?: PageObjectType
    searchConfig?: GlobalSearchConfig
    customFilters?: CustomFilterConfig[]
  }
}
