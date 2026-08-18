import 'vue-router'
import type { GlobalSearchConfig } from '@datagouv/components-next'
import type { PageConf, PageObjectType } from '@/model/config'
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
    // GlobalSearch-specific
    searchType?: PageObjectType
    searchConfig?: GlobalSearchConfig
    customFilters?: CustomFilterConfig[]
    // Network pages (src/router/utils.ts useNetworkRoutes): pageConf is only set
    // as an override when the page isn't in config.pages (i.e. network pages).
    pageConf?: PageConf
    // Overrides NavigationComponent's isActive() path-prefix matching for pages
    // whose route doesn't share a path prefix with their nav menu entry.
    activeMenuLink?: string
    // Extra breadcrumb entry spliced between "Accueil" and the page's own title.
    parentBreadcrumb?: { to: string; text: string }
  }
}
