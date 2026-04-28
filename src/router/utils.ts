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

// FIXME: tight coupling on upstream types — filter interfaces are not re-exported by
// @datagouv/components-next, so we infer them from return shapes. If the package changes
// its return shape (e.g. renames basicFilters), these types silently break. Ask upstream
// to export the filter interfaces directly.
type DatasetFilterKey = NonNullable<
  ReturnType<typeof getDefaultDatasetConfig>['basicFilters']
>[number]
type DatasetHiddenFilter = NonNullable<
  ReturnType<typeof getDefaultDatasetConfig>['hiddenFilters']
>[number]
type DataserviceFilterKey = NonNullable<
  ReturnType<typeof getDefaultDataserviceConfig>['basicFilters']
>[number]
type DataserviceHiddenFilter = NonNullable<
  ReturnType<typeof getDefaultDataserviceConfig>['hiddenFilters']
>[number]
type TopicFilterKey = NonNullable<
  ReturnType<typeof getDefaultTopicConfig>['basicFilters']
>[number]
type TopicHiddenFilter = NonNullable<
  ReturnType<typeof getDefaultTopicConfig>['hiddenFilters']
>[number]

export interface CustomSelectFilterConfig {
  urlParam: string
  label: string
  defaultLabel: string
  apiParam: string
  values: Array<{ value: string; label: string }>
}

export interface OrganizationFilterConfig {
  urlParam: 'organization'
  label: string
  defaultLabel: string
  apiParam: 'organization'
  pageKey: string
}

export type CustomFilterConfig =
  | CustomSelectFilterConfig
  | OrganizationFilterConfig

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
  listViewComponent: () => Promise<{ default: Component }>
  detailsViewComponent: () => Promise<{ default: Component }>
  cardComponent?: () => Promise<{ default: Component }>
  datasetCardComponent?: () => Promise<{ default: Component }>
  descriptionComponent?: () => Promise<{ default: Component }>
  props?: Record<string, unknown>
  // GlobalSearch-specific
  searchType?: PageObjectType
  searchConfig?: GlobalSearchConfig
  customSelectFilters?: CustomFilterConfig[]
}

export const useSearchPageRoutes = ({
  pageKey,
  metaTitle,
  listViewComponent,
  detailsViewComponent,
  cardComponent,
  datasetCardComponent,
  descriptionComponent,
  props,
  searchType,
  searchConfig,
  customSelectFilters
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
          cardComponent,
          searchType,
          searchConfig,
          customSelectFilters
        },
        component: listViewComponent,
        props: () => ({
          // no props needed — UnifiedSearchView reads everything from the route directly
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
          // forces component remount when switching between page types
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
    ([key, value]) => ({ key, value }) as { key: string; value: unknown }
  )
  const basicFilters: string[] = []
  const advancedFilters: string[] = []
  for (const filter of pageConf.filters ?? []) {
    if (!NATIVE_FILTER_TYPE_SET.has(filter.type)) continue
    if (!filter.search_display) {
      console.warn(
        `[ecospheres] Filter "${filter.id}" on page "${pageKey}" has no search_display — it will not be shown. Add search_display: basic or advanced to the config.`
      )
      continue
    }
    if (filter.search_display === 'basic') {
      basicFilters.push(filter.type)
    } else {
      advancedFilters.push(filter.type)
    }
  }
  const name = pageConf.breadcrumb_title ?? pageConf.title
  if (searchType === 'topics') {
    return getDefaultTopicConfig({
      key: pageKey,
      name,
      hiddenFilters: hiddenFilters as TopicHiddenFilter[],
      basicFilters: basicFilters as TopicFilterKey[],
      advancedFilters: advancedFilters as TopicFilterKey[]
    })
  } else if (searchType === 'dataservices') {
    return getDefaultDataserviceConfig({
      key: pageKey,
      name,
      hiddenFilters: hiddenFilters as DataserviceHiddenFilter[],
      basicFilters: basicFilters as DataserviceFilterKey[],
      advancedFilters: advancedFilters as DataserviceFilterKey[]
    })
  } else {
    return getDefaultDatasetConfig({
      key: pageKey,
      name,
      hiddenFilters: hiddenFilters as DatasetHiddenFilter[],
      basicFilters: basicFilters as DatasetFilterKey[],
      advancedFilters: advancedFilters as DatasetFilterKey[],
      sortOptions: datasetSortOptions
    })
  }
}

/**
 * Builds a GlobalSearchConfig from all list_all pages in the site config.
 * Pages are included in their config definition order — the same order on every page —
 * so the type selector is stable across page switches.
 * Each page gets key=pageKey so same-class pages (e.g. datasets + indicators) are distinct.
 * Also returns customSelectFilters for the primary page for rendering via the #custom-filters slot.
 */
function buildGlobalSearchConfig(pageKey: string): {
  searchConfig: GlobalSearchConfig
  customSelectFilters: CustomFilterConfig[]
} {
  const pageConf = usePageConf(pageKey)
  const allPages = usePagesConf()
  const searchConfig: GlobalSearchConfig = []
  for (const [key, conf] of Object.entries(allPages)) {
    if (!conf.list_all) continue
    searchConfig.push(buildSingleTypeConfig(key, conf.object_type))
  }

  // Build customSelectFilters for the primary page (rendered via SearchSelectFilter/SearchOrganizationFilter in #custom-filters slot).
  const customSelectFilters: CustomFilterConfig[] = (pageConf.filters ?? [])
    .filter((f) => {
      const isRenderable =
        (f.type === 'select' && f.values?.length) ||
        f.type === 'organization_custom'
      if (isRenderable && !f.search_display) {
        console.warn(
          `[ecospheres] Filter "${f.id}" on page "${pageKey}" has no search_display — it will not be shown. Add search_display: basic or advanced to the config.`
        )
      }
      return isRenderable && !!f.search_display
    })
    .map((f) => {
      if (f.type === 'organization_custom') {
        return {
          urlParam: 'organization',
          label: f.name,
          defaultLabel: f.default_option ?? 'Toutes les organisations',
          apiParam: 'organization',
          pageKey
        }
      }
      return {
        urlParam: f.id,
        label: f.name,
        defaultLabel: f.default_option ?? 'Tous',
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

  return { searchConfig, customSelectFilters }
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

  const { searchConfig, customSelectFilters } = buildGlobalSearchConfig(pageKey)

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
    searchConfig,
    customSelectFilters
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
