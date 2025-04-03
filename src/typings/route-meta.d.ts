import 'vue-router'

// To ensure it is treated as a module, add at least one `export` statement
export {}

// FIXME: inject @router/utils.ts RouteMeta here
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
  }
}
