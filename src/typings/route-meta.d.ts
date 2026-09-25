import 'vue-router'
import type { GlobalSearchConfig } from '@datagouv/components-next'
import type { BreadcrumbItem } from '@/model/breadcrumb'
import type { PageListConf, PageObjectType } from '@/model/config'
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
    // Detail page's object type, regardless of pageKey (datasets, indicators, ...)
    objectType?: PageObjectType
    // Hides the site header/notice/footer, for pages rendering their own fullscreen layout
    fullscreen?: boolean
    // Skips the router's default scroll reset when a same-route navigation only replaces the query
    preserveScrollOnReplace?: boolean
    // GlobalSearch-specific
    searchType?: PageObjectType
    searchConfig?: GlobalSearchConfig
    customFilters?: CustomFilterConfig[]
    // Network pages (src/router/utils.ts useNetworkRoutes): pageConf is only set
    // as an override when the page isn't in config.pages (i.e. network pages).
    // Typed as the lighter PageListConf since network pages never carry detail-only
    // fields; useCurrentPageConf() asserts back to PageConf for its (detail-only) callers.
    pageConf?: PageListConf
    // Overrides NavigationComponent's isActive() path-prefix matching for pages
    // whose route doesn't share a path prefix with their nav menu entry.
    activeMenuLink?: string
    // Extra breadcrumb entries spliced between "Accueil" and the page's own title.
    parentBreadcrumbs?: BreadcrumbItem[]
    // Overrides the pageKey used to build item detail links, for pages whose items
    // are detailed on another page's route (see buildListPageRoute in router/utils.ts).
    detailPageKey?: string
  }
}
