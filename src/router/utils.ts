import {
  GlobalSearchNativeFilterType,
  type PageObjectType
} from '@/model/config'
import { usePageConf, usePagesConf } from '@/utils/config'
import {
  getDefaultDataserviceConfig,
  getDefaultDatasetConfig,
  getDefaultTopicConfig,
  type GlobalSearchConfig
} from '@datagouv/components-next'
import { type Component } from 'vue'
import {
  useRoute,
  type RouteLocationNormalizedLoaded,
  type RouteRecordRaw
} from 'vue-router'
import type { TopicPageRouterConf } from './model'

export interface SelectFilterConfig {
  urlParam: string
  label: string
  defaultLabel?: string
  apiParam: string
  values: Array<{ value: string; label: string }>
}

export interface OrganizationFilterConfig {
  label: string
  defaultLabel?: string
  pageKey: string
}

export type CustomFilterConfig = SelectFilterConfig | OrganizationFilterConfig

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

const datasetSortOptions = [
  { value: '-created' as const, label: 'Date de création' },
  { value: '-last_update' as const, label: 'Dernière mise à jour' }
]

/**
 * Builds a single SearchTypeConfig for one page.
 * Sets key=pageKey so multiple pages with the same object_type are differentiated.
 * Sets name from breadcrumb_title or title for the type selector label.
 */
function buildSingleTypeConfig(
  pageKey: string,
  searchType: PageObjectType
): GlobalSearchConfig[number] {
  const pageConf = usePageConf(pageKey)
  const hiddenFilters = Object.entries(pageConf.universe_query ?? {}).map(
    ([key, value]) => ({ key, value })
  )
  const basicFilters: string[] = []
  const advancedFilters: string[] = []
  for (const filter of pageConf.filters) {
    if (!NATIVE_FILTER_TYPE_SET.has(filter.type)) continue
    if (!filter.search_display) {
      console.warn(
        `Filter "${filter.id}" on page "${pageKey}" has no search_display — it will not be shown. Add search_display: basic or advanced to the config.`
      )
      continue
    }
    if (filter.search_display === 'basic') {
      basicFilters.push(filter.type)
    } else {
      advancedFilters.push(filter.type)
    }
  }
  // GlobalSearch checks `'placeholder' in cfg` (not `cfg.placeholder !== undefined`), so
  // spreading `placeholder: undefined` would suppress the upstream default. Only include the
  // key when the YAML explicitly sets it (null = empty input, string = custom text).
  const { placeholder } = pageConf.search
  const baseArgs = {
    key: pageKey,
    name: pageConf.breadcrumb_title ?? pageConf.title,
    hiddenFilters,
    basicFilters,
    advancedFilters,
    ...(placeholder !== undefined ? { placeholder } : {})
  }
  // FIXME: tight coupling on upstream types — filter interfaces are not exported by
  // @datagouv/components-next, so we cast each call's args. Ask upstream to export them.
  if (searchType === 'topics') {
    return getDefaultTopicConfig(
      baseArgs as Parameters<typeof getDefaultTopicConfig>[0]
    )
  }
  if (searchType === 'dataservices') {
    return getDefaultDataserviceConfig(
      baseArgs as Parameters<typeof getDefaultDataserviceConfig>[0]
    )
  }
  return getDefaultDatasetConfig({
    ...baseArgs,
    sortOptions: datasetSortOptions
  } as Parameters<typeof getDefaultDatasetConfig>[0])
}

/**
 * Builds a GlobalSearchConfig from all list_all pages in the site config.
 * Pages are included in their config definition order — the same order on every page —
 * so the type selector is stable across page switches.
 * Each page gets key=pageKey so same-class pages (e.g. datasets + indicators) are distinct.
 * Also returns customFilters for the primary page for rendering via the #custom-filters slot.
 */
function buildGlobalSearchConfig(pageKey: string): {
  searchConfig: GlobalSearchConfig
  customFilters: CustomFilterConfig[]
} {
  const pageConf = usePageConf(pageKey)
  const allPages = usePagesConf()
  const searchConfig: GlobalSearchConfig = []
  for (const [key, conf] of Object.entries(allPages)) {
    if (!conf.list_all) continue
    searchConfig.push(buildSingleTypeConfig(key, conf.object_type))
  }

  // Build customFilters for the primary page (rendered via SearchSelectFilter/SearchOrganizationFilter in #custom-filters slot).
  const customFilters: CustomFilterConfig[] = pageConf.filters
    .filter((f) => {
      const isRenderable =
        (f.type === 'select' && f.values?.length) ||
        f.type === 'organization_custom'
      if (isRenderable && !f.search_display) {
        console.warn(
          `Filter "${f.id}" on page "${pageKey}" has no search_display — it will not be shown. Add search_display: basic or advanced to the config.`
        )
      }
      return isRenderable && !!f.search_display
    })
    .map((f) => {
      if (f.type === 'organization_custom') {
        return {
          label: f.name,
          defaultLabel: f.default_option ?? undefined,
          pageKey
        }
      }
      return {
        urlParam: f.id,
        label: f.name,
        defaultLabel: f.default_option ?? undefined,
        apiParam: f.api_param ?? 'tag',
        values: (f.values ?? []).map((v) => ({
          value:
            f.use_filter_prefix && pageConf.filter_prefix
              ? `${pageConf.filter_prefix}-${f.id}-${v.id}`
              : v.id,
          label: v.name
        }))
      }
    })

  return { searchConfig, customFilters }
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
  const { searchConfig, customFilters } = buildGlobalSearchConfig(pageKey)

  const defaultDetailsViews: Record<PageObjectType, () => Promise<unknown>> = {
    dataservices: () =>
      import('@/views/dataservices/DataserviceDetailView.vue'),
    topics: () => import('@/views/topics/TopicDetailView.vue'),
    datasets: () => import('@/views/datasets/DatasetDetailView.vue')
  }

  return {
    path: `/${pageKey}`,
    children: [
      {
        path: '',
        name: pageKey,
        meta: {
          title: pageConf.title,
          pageKey,
          cardComponent,
          searchType: objectType,
          searchConfig,
          customFilters
        },
        component: () => import('@/views/UnifiedSearchView.vue')
      },
      {
        path: ':item_id',
        name: `${pageKey}_detail`,
        component: detailsViewComponent ?? defaultDetailsViews[objectType],
        meta: {
          pageKey,
          descriptionComponent,
          cardComponent,
          datasetCardComponent
        },
        // this forces the component to be recreated when switching page type
        props: () => ({ key: pageKey, ...topicConf })
      }
    ]
  }
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
