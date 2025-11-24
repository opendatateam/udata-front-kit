import 'vue-router'

// To ensure it is treated as a module, add at least one `export` statement
export {}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    filtersComponent?: () => Promise<{ default: Component }>
    cardComponent?: () => Promise<{ default: Component }>
    listComponent?: () => Promise<{ default: Component }>
    descriptionComponent?: () => Promise<{ default: Component }>
    cardClass?: string
    pageKey?: string
  }
}
