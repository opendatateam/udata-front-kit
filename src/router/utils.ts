import type { SiteId } from '@/model/topic'
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
  props?: Record<string, unknown>
}

// FIXME: move somewhere else? e.g. @/router/model.ts
export interface TopicPageRouterConf {
  listAll: boolean
  displayMetadata: boolean
  enableReadMore: boolean
  datasetEditorialization: boolean
  extrasKey: SiteId
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
  'listViewComponent' | 'detailsViewComponent'
> & {
  detailsViewComponent?: () => Promise<{ default: Component }>
}

export const useDatasetSearchPageRoutes = ({
  pageKey,
  metaTitle,
  cardClass,
  filtersComponent,
  cardComponent,
  detailsViewComponent
}: DatasetSearchPageRouteOptions): RouteRecordRaw => {
  const listViewComponent = () =>
    import('@/views/datasets/DatasetsListView.vue')
  const defaultDetailsViewComponent = () =>
    import('@/views/datasets/DatasetDetailView.vue')
  return useSearchPageRoutes({
    pageKey,
    metaTitle,
    cardClass,
    listViewComponent,
    filtersComponent,
    cardComponent,
    detailsViewComponent: detailsViewComponent ?? defaultDetailsViewComponent
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
    // loosen type before sending to generic fn
    props: topicConf as unknown as Record<string, unknown>
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
  props
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
          page: route.query.page,
          ...props
        })
      },
      {
        path: ':item_id',
        name: `${pageKey}_detail`,
        component: detailsViewComponent,
        meta: {
          pageKey
        },
        props: props || {}
      }
    ]
  }
}

export const useTopicAdminPagesRoutes = ({
  pageKey,
  topicConf
}: {
  pageKey: string
  topicConf: TopicPageRouterConf
}): RouteRecordRaw[] => {
  return [
    {
      path: `/admin/${pageKey}/add`,
      name: `${pageKey}_add`,
      component: async () => await import('@/views/topics/TopicFormView.vue'),
      meta: { requiresAuth: true, pageKey },
      props: { isCreate: true, ...topicConf }
    },
    {
      path: `/admin/${pageKey}/edit/:item_id`,
      name: `${pageKey}_edit`,
      component: async () => await import('@/views/topics/TopicFormView.vue'),
      meta: { requiresAuth: true, pageKey },
      props: { isCreate: false, ...topicConf }
    }
  ]
}

export const useRouteMeta = () => {
  return useRoute().meta
}
