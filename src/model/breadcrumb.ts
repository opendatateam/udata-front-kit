import type { RouteLocationRaw } from 'vue-router'

export interface BreadcrumbItem {
  to?: RouteLocationRaw
  text: string
}
