import { usePageConf } from '@/utils/config'
import { type Component } from 'vue'
import {
  useRoute,
  type RouteLocationNormalizedLoaded,
  type RouteRecordRaw
} from 'vue-router'
import type { TopicPageRouterConf } from './model'

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
 * Converts route params from potential arrays to single strings
 * Warning: this will discard additional values if param is an array
 */
const convertParamsToString = (
  params: Record<string, string | string[]>
): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value
    ])
  )
}

/**
 * Exposes first element from route params that could contain an array
 * Warning: this will discard the other values if any
 */
export const useRouteParamsAsString = (): RouteLocationParamsAsString => {
  const route = useRoute()
  const params = convertParamsToString(route.params)
  return { ...route, params }
}

/**
 * Reactive version of useRouteParamsAsString
 * Returns a computed ref that updates when route params change
 */
export const useRouteParamsAsStringReactive = () => {
  const route = useRoute()
  return computed(() => ({
    ...route,
    params: convertParamsToString(route.params)
  }))
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
  listComponent?: () => Promise<{ default: Component }>
  detailsViewComponent: () => Promise<{ default: Component }>
  filtersComponent?: () => Promise<{ default: Component }>
  cardComponent?: () => Promise<{ default: Component }>
  descriptionComponent?: () => Promise<{ default: Component }>
  props?: Record<string, unknown>
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
  const listViewComponent = () => import('@/views/data/DataListView.vue')
  const listComponent = () => import('@/components/datasets/DatasetList.vue')
  const defaultDetailsViewComponent = () =>
    import('@/views/datasets/DatasetDetailView.vue')
  return useSearchPageRoutes({
    pageKey,
    metaTitle,
    cardClass,
    listViewComponent,
    listComponent,
    filtersComponent,
    cardComponent,
    detailsViewComponent: detailsViewComponent ?? defaultDetailsViewComponent
  })
}

type DataserviceSearchPageRouteOptions = Omit<
  SearchPageRoutesOptions,
  'listViewComponent' | 'detailsViewComponent'
>

export const useDataserviceSearchPageRoutes = ({
  pageKey,
  metaTitle,
  cardClass,
  filtersComponent,
  cardComponent
}: DataserviceSearchPageRouteOptions): RouteRecordRaw => {
  const listViewComponent = () => import('@/views/data/DataListView.vue')
  const listComponent = () =>
    import('@/components/dataservices/DataservicesList.vue')
  const detailsViewComponent = () =>
    import('@/views/dataservices/DataserviceDetailView.vue')
  return useSearchPageRoutes({
    pageKey,
    metaTitle,
    cardClass,
    listViewComponent,
    listComponent,
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
  cardComponent,
  descriptionComponent
}: TopicSearchPageRoutesOptions): RouteRecordRaw => {
  const listViewComponent = () => import('@/views/topics/TopicsListView.vue')
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
    descriptionComponent,
    // loosen type before sending to generic fn
    props: topicConf as unknown as Record<string, unknown>
  })
}

export const useSearchPageRoutes = ({
  pageKey,
  metaTitle,
  cardClass,
  listViewComponent,
  listComponent,
  detailsViewComponent,
  filtersComponent,
  cardComponent,
  descriptionComponent,
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
          cardComponent,
          listComponent
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
          pageKey,
          descriptionComponent
        },
        props: () => ({
          // this forces the component to be recreated when switching page type
          key: pageKey,
          ...props
        })
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

export const useCurrentPageConf = () => {
  const meta = useRouteMeta()
  if (!meta.pageKey) {
    throw new Error('Page key is not defined in route meta')
  }
  return {
    pageKey: meta.pageKey,
    meta,
    pageConf: usePageConf(meta.pageKey)
  }
}
