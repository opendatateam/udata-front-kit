import { type Component } from 'vue'
import {
  useRoute,
  type RouteLocationNormalizedLoaded,
  type RouteRecordRaw
} from 'vue-router'

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

interface SearchPageRoutesOptions {
  pageKey: string
  metaTitle: string
  cardClass?: string
  listViewComponent: () => Promise<{ default: Component }>
  detailsViewComponent: () => Promise<{ default: Component }>
  filtersComponent?: () => Promise<{ default: Component }>
  cardComponent?: () => Promise<{ default: Component }>
  detailsViewProps?: Record<string, unknown>
}

// FIXME: move somewhere else? e.g. @/router/model.ts
export interface TopicPageRouterConf {
  listAll: boolean
  displayMetadata: boolean
  enableReadMore: boolean
  datasetEditorialization: boolean
  name: string
}

interface TopicSearchPageRoutesOptions
  extends Omit<
    SearchPageRoutesOptions,
    'detailsViewComponent' | 'listViewComponent'
  > {
  topicConf: TopicPageRouterConf
}

type DatasetSearchPageRouteOptions = Omit<
  SearchPageRoutesOptions,
  'detailsViewComponent' | 'listViewComponent'
>

export const useDatasetSearchPageRoutes = ({
  pageKey,
  metaTitle,
  cardClass,
  filtersComponent,
  cardComponent
}: DatasetSearchPageRouteOptions): RouteRecordRaw => {
  const listViewComponent = () =>
    import('@/views/datasets/DatasetsListView.vue')
  const detailsViewComponent = () =>
    import('@/views/datasets/DatasetDetailView.vue')
  return useSearchPageRoutes({
    pageKey,
    metaTitle,
    cardClass,
    listViewComponent,
    filtersComponent,
    cardComponent,
    detailsViewComponent
  })
}

export const useTopicSearchPageRoutes = ({
  pageKey,
  metaTitle,
  topicConf,
  cardClass,
  filtersComponent,
  cardComponent
}: TopicSearchPageRoutesOptions): RouteRecordRaw => {
  const listViewComponent = () =>
    import(
      topicConf.listAll
        ? '@/views/topics/TopicsListView.vue'
        : '@/views/NotFoundView.vue'
    )
  const detailsViewComponent = () =>
    import('@/views/topics/TopicDetailView.vue')
  return useSearchPageRoutes({
    pageKey,
    metaTitle,
    cardClass,
    listViewComponent,
    filtersComponent,
    cardComponent,
    detailsViewComponent,
    detailsViewProps: topicConf as unknown as Record<
      string,
      unknown
    > /* loosen type before sending to generic fn */
  })
}

export const useSearchPageRoutes = ({
  pageKey,
  metaTitle,
  cardClass,
  listViewComponent,
  detailsViewComponent,
  filtersComponent,
  cardComponent,
  detailsViewProps
}: SearchPageRoutesOptions): RouteRecordRaw => {
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
        },
        component: listViewComponent,
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
        component: detailsViewComponent,
        meta: {
          pageKey
        },
        props: detailsViewProps || {}
      }
    ]
  }
}

export const useTopicAdminPagesRoutes = (pageKey: string): RouteRecordRaw[] => {
  return [
    {
      path: `/admin/${pageKey}/add`,
      name: `${pageKey}_add`,
      component: async () => await import('@/views/topics/TopicFormView.vue'),
      meta: { requiresAuth: true },
      props: { isCreate: true }
    },
    {
      path: `/admin/${pageKey}/edit/:bid`,
      name: `${pageKey}_edit`,
      component: async () => await import('@/views/topics/TopicFormView.vue'),
      meta: { requiresAuth: true },
      props: { isCreate: false }
    }
  ]
}

export const useRouteMeta = () => {
  return useRoute().meta
}
