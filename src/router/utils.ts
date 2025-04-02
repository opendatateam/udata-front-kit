import type { RouteMeta } from '@/router'
import { useRoute, type RouteLocationNormalizedLoaded } from 'vue-router'

export type QueryAsString = Record<string, string | null | undefined>

interface RouteLocationParamsAsString
  extends Omit<RouteLocationNormalizedLoaded, 'params'> {
  params: Record<string, string>
}

interface RouteLocationQueryAsString
  extends Omit<RouteLocationNormalizedLoaded, 'query'> {
  query: QueryAsString
}

/**
 * Exposes first element from route params that could contain an array
 * Warning: this will discard the other values if any
 */
export const useRouteParamsAsString = (): RouteLocationParamsAsString => {
  const route = useRoute()
  const params = Object.fromEntries(
    Object.entries(route.params).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value
    ])
  )
  return { ...route, params }
}

/**
 * Exposes first element from route query that could contain an array
 * Warning: this will discard the other values if any
 */
export const useRouteQueryAsString = (): RouteLocationQueryAsString => {
  const route = useRoute()
  const query = Object.fromEntries(
    Object.entries(route.query).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value
    ])
  )
  return { ...route, query }
}

export const useSearchPageRoutes = ({
  pageKey,
  metaTitle,
  cardClass,
  filtersComponent,
  cardComponent,
  detailViewComponent
}: {
  pageKey: string
  metaTitle: string
  cardClass?: string
  filtersComponent?: () => Promise<{ default: Component }>
  cardComponent?: () => Promise<{ default: Component }>
  detailViewComponent?: () => Promise<{ default: Component }>
}) => {
  return {
    path: `/${pageKey}`,
    children: [
      {
        path: '',
        name: pageKey,
        meta: {
          title: metaTitle,
          pageKey,
          cardClass,
          filtersComponent,
          cardComponent
        } as RouteMeta,
        component: async () =>
          await import('@/views/datasets/DatasetsListView.vue'),
        props: (route: RouteLocationNormalizedLoaded) => ({
          // this forces the component to be recreated when switching page type
          key: pageKey,
          query: route.query.q,
          page: route.query.page
        })
      },
      {
        path: ':item_id',
        name: `${pageKey}_detail`,
        component:
          detailViewComponent ??
          (async () => await import('@/views/datasets/DatasetDetailView.vue'))
      }
    ]
  }
}
