import {
  GlobalSearchNativeFilterType,
  type PageObjectType
} from '@/model/config'
import { usePageConf } from '@/utils/config'
import {
  getDefaultDataserviceConfig,
  getDefaultDatasetConfig,
  getDefaultTopicConfig,
  type GlobalSearchConfig,
  type TagFilterConfig
} from '@datagouv/components-next'
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
  datasetCardComponent?: () => Promise<{ default: Component }>
  descriptionComponent?: () => Promise<{ default: Component }>
  props?: Record<string, unknown>
  // GlobalSearch-specific
  searchType?: PageObjectType
  searchConfig?: GlobalSearchConfig
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
  datasetCardComponent,
  descriptionComponent,
  props,
  searchType,
  searchConfig
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
          listComponent,
          searchType,
          searchConfig
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
          pageKey,
          descriptionComponent,
          cardComponent,
          datasetCardComponent
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

interface GlobalSearchPageRoutesOptions {
  pageKey: string
  cardComponent?: () => Promise<{ default: Component }>
  datasetCardComponent?: () => Promise<{ default: Component }>
  descriptionComponent?: () => Promise<{ default: Component }>
  detailsViewComponent?: () => Promise<{ default: Component }>
  topicConf?: TopicPageRouterConf
}

const NATIVE_FILTER_TYPE_SET = new Set<string>(
  Object.values(GlobalSearchNativeFilterType)
)

/**
 * Builds a GlobalSearchConfig from the page's YAML config.
 * Converts universe_query → hiddenFilters.
 * Derives basicFilters/advancedFilters from filters with search_display set and a GlobalSearch-native type.
 */
function buildGlobalSearchConfig(
  pageKey: string,
  searchType: PageObjectType
): GlobalSearchConfig {
  const pageConf = usePageConf(pageKey)
  const hiddenFilters = Object.entries(pageConf.universe_query ?? {}).map(
    ([key, value]) => ({ key, value }) as { key: string; value: unknown }
  )
  const basicFilters: string[] = []
  const advancedFilters: string[] = []
  for (const filter of pageConf.filters ?? []) {
    if (!filter.search_display) continue
    if (!NATIVE_FILTER_TYPE_SET.has(filter.type)) continue
    // For native types, the type string IS the GlobalSearch filter key
    if (filter.search_display === 'basic') {
      basicFilters.push(filter.type)
    } else {
      advancedFilters.push(filter.type)
    }
  }
  // Build tagFilters from select-type filters that have search_display set and
  // no explicit api_param (or api_param === 'tag'). Their selected value is
  // merged into the "tag" API parameter alongside any hiddenFilters tag values
  // inside GlobalSearch. Prefixed values follow the same convention as the old
  // useFilterValue: `${filter_prefix}-${filter.id}-${value.id}`.
  const tagFilters: TagFilterConfig[] = (pageConf.filters ?? [])
    .filter(
      (f) =>
        f.type === 'select' &&
        f.values?.length &&
        f.search_display &&
        (!f.api_param || f.api_param === 'tag')
    )
    .map((f) => ({
      urlParam: f.id,
      label: f.name,
      defaultLabel: f.default_option ?? 'Tous',
      values: (f.values ?? []).map((v) => ({
        value:
          f.use_filter_prefix && pageConf.filter_prefix
            ? `${pageConf.filter_prefix}-${f.id}-${v.id}`
            : v.id,
        label: v.name
      }))
    }))
  const overrides = {
    hiddenFilters,
    basicFilters,
    advancedFilters,
    ...(tagFilters.length ? { tagFilters } : {})
  }
  if (searchType === 'topics') {
    return [getDefaultTopicConfig(overrides)]
  } else if (searchType === 'dataservices') {
    return [getDefaultDataserviceConfig(overrides)]
  } else {
    return [getDefaultDatasetConfig(overrides)]
  }
}

/**
 * Creates routes for a GlobalSearch-based list page.
 * Reads universe_query and filters[].search_display from YAML; only component references are passed as arguments.
 */
export const useGlobalSearchPageRoutes = ({
  pageKey,
  cardComponent,
  datasetCardComponent,
  descriptionComponent,
  detailsViewComponent,
  topicConf
}: GlobalSearchPageRoutesOptions): RouteRecordRaw => {
  const pageConf = usePageConf(pageKey)
  const objectType = pageConf.object_type
  const listViewComponent = () => import('@/views/UnifiedSearchView.vue')

  const searchConfig = buildGlobalSearchConfig(pageKey, objectType)

  const defaultDetailsView = () =>
    objectType === 'dataservices'
      ? import('@/views/dataservices/DataserviceDetailView.vue')
      : objectType === 'topics'
        ? import('@/views/topics/TopicDetailView.vue')
        : import('@/views/datasets/DatasetDetailView.vue')

  return useSearchPageRoutes({
    pageKey,
    metaTitle: pageConf.title,
    listViewComponent,
    detailsViewComponent: detailsViewComponent ?? defaultDetailsView,
    cardComponent,
    datasetCardComponent,
    descriptionComponent,
    props: topicConf as unknown as Record<string, unknown>,
    searchType: objectType,
    searchConfig
  })
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
