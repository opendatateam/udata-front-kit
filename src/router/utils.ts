import config from '@/config'
import {
  CUSTOM_FILTER_TYPES,
  type CustomFilterType,
  type NetworkConf,
  type OrganizationsConfig,
  type PageConf,
  type PageObjectType
} from '@/model/config'
import { useNetworksConf, usePageConf, usePagesConf } from '@/utils/config'
import {
  getDefaultDataserviceConfig,
  getDefaultDatasetConfig,
  getDefaultTopicConfig,
  type DataserviceSearchConfig,
  type DatasetSearchConfig,
  type GlobalSearchConfig,
  type TopicSearchConfig
} from '@datagouv/components-next'
import { type Component } from 'vue'
import {
  useRoute,
  type RouteLocationNormalizedLoaded,
  type RouteRecordRaw
} from 'vue-router'
import type { TopicPageRouterConf } from './model'

interface FilterConfigBase {
  urlParam: string
  label: string
  defaultLabel?: string
  typeKeys: string[]
}

export interface SelectFilterConfig extends FilterConfigBase {
  apiParam: string
  values: Array<{ value: string; label: string }>
}

export interface OrganizationFilterConfig extends FilterConfigBase {
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

interface GlobalSearchPageRoutesOptions {
  pageKey: string
  // Override for pages not present in config.pages (network pages — see useNetworkRoutes).
  // When omitted, the page's config is looked up from config.pages via usePageConf(pageKey).
  pageConf?: PageConf
  // Overrides the route's root path, which otherwise defaults to `/${pageKey}`.
  basePath?: string
  // Overrides the set of pages bundled into this page's GlobalSearch type switcher.
  // Must be keyed by the full pageKey used for each sibling's route name (see useNetworkRoutes).
  // When omitted, defaults to every list_all page in config.pages.
  siblingPages?: Record<string, PageConf>
  activeMenuLink?: string
  parentBreadcrumb?: { to: string; text: string }
  cardComponent?: () => Promise<{ default: Component }>
  datasetCardComponent?: () => Promise<{ default: Component }>
  descriptionComponent?: () => Promise<{ default: Component }>
  detailsViewComponent?: () => Promise<{ default: Component }>
  topicConf?: TopicPageRouterConf
  renderRootPage?: boolean
}

const CUSTOM_FILTER_TYPE_SET = new Set<CustomFilterType>(CUSTOM_FILTER_TYPES)

/**
 * Builds a single SearchTypeConfig for one page.
 * Sets key=pageKey so multiple pages with the same object_type are differentiated.
 * Sets name from breadcrumb_title or title for the type selector label.
 */
function buildSingleTypeConfig(
  pageKey: string,
  pageConf: PageConf
): GlobalSearchConfig[number] {
  const searchType = pageConf.object_type
  const hiddenFilters = Object.entries(pageConf.universe_query ?? {}).map(
    ([key, value]) => ({ key, value })
  )
  const basicFilters: string[] = []
  const advancedFilters: string[] = []
  for (const filter of pageConf.filters) {
    if (CUSTOM_FILTER_TYPE_SET.has(filter.type as CustomFilterType)) continue
    if (filter.advanced) {
      advancedFilters.push(filter.type)
    } else {
      basicFilters.push(filter.type)
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
    ...(placeholder !== undefined ? { placeholder } : {}),
    ...(pageConf.icon !== undefined ? { icon: pageConf.icon } : {}),
    ...(pageConf.default_sort ? { defaultSort: pageConf.default_sort } : {})
  }
  // basicFilters/advancedFilters are string[] but upstream expects per-type key unions
  // (e.g. keyof DatasetSearchFilters) — cast is intentional, filter keys come from YAML config.
  if (searchType === 'topics') {
    return getDefaultTopicConfig(
      baseArgs as Partial<Omit<TopicSearchConfig, 'class'>>
    )
  }
  if (searchType === 'dataservices') {
    return getDefaultDataserviceConfig(
      baseArgs as Partial<Omit<DataserviceSearchConfig, 'class'>>
    )
  }
  return getDefaultDatasetConfig({
    ...baseArgs,
    sortOptions: [
      { value: '-created' as const, label: 'Date de création' },
      { value: '-last_update' as const, label: 'Dernière mise à jour' }
    ]
  } as Partial<Omit<DatasetSearchConfig, 'class'>>)
}

/**
 * Builds a GlobalSearchConfig from all list_all pages in the site config.
 * Pages are included in their config definition order — the same order on every page —
 * so the type selector is stable across page switches.
 * Each page gets key=pageKey so same-class pages (e.g. datasets + indicators) are distinct.
 * Also returns customFilters for the primary page for rendering via the #custom-filters slot.
 */
export function buildGlobalSearchConfig(
  pageKey: string,
  opts?: { pageConf?: PageConf; siblingPages?: Record<string, PageConf> }
): {
  searchConfig: GlobalSearchConfig
  customFilters: CustomFilterConfig[]
} {
  const pageConf = opts?.pageConf ?? usePageConf(pageKey)
  const searchConfig: GlobalSearchConfig = []
  if (opts?.siblingPages) {
    for (const [key, conf] of Object.entries(opts.siblingPages)) {
      searchConfig.push(buildSingleTypeConfig(key, conf))
    }
  } else {
    const allPages = usePagesConf()
    for (const [key, conf] of Object.entries(allPages)) {
      if (!conf.list_all) continue
      searchConfig.push(buildSingleTypeConfig(key, conf))
    }
  }

  // Build customFilters for the primary page (rendered via SearchSelectFilter/SearchOrganizationFilter in #custom-filters slot).
  const customFilters: CustomFilterConfig[] = pageConf.filters
    .filter((f) => CUSTOM_FILTER_TYPE_SET.has(f.type as CustomFilterType))
    .flatMap((f): CustomFilterConfig[] => {
      if (f.type === 'organization_custom') {
        return [
          {
            urlParam: f.id,
            label: f.name,
            defaultLabel: f.default_option ?? undefined,
            typeKeys: [pageKey],
            pageKey
          }
        ]
      } else if (f.type === 'select') {
        if (!f.values.length) {
          console.warn(`No values set for select filter '${f.name}', skipping.`)
          return []
        }
        const rawTypeKeys = f.applies_to_pages ?? [pageKey]
        const typeKeys = rawTypeKeys.includes(pageKey)
          ? rawTypeKeys
          : [pageKey, ...rawTypeKeys]
        return [
          {
            urlParam: f.id,
            label: f.name,
            defaultLabel: f.default_option ?? undefined,
            typeKeys,
            apiParam: f.api_param ?? 'tag',
            values: (f.values ?? []).map((v) => ({
              value:
                f.use_filter_prefix && pageConf.filter_prefix
                  ? `${pageConf.filter_prefix}-${f.id}-${v.id}`
                  : v.id,
              label: v.name
            }))
          }
        ]
      } else {
        console.error(`Unhandled custom filter type: ${f.type}`)
        return []
      }
    })

  return { searchConfig, customFilters }
}

/**
 * Creates routes for a GlobalSearch-based list page.
 * Reads universe_query and filters[].advanced from YAML; only component references are passed as arguments.
 */
export const useGlobalSearchPageRoutes = ({
  pageKey,
  pageConf: pageConfOverride,
  basePath,
  siblingPages,
  activeMenuLink,
  parentBreadcrumb,
  cardComponent,
  datasetCardComponent,
  descriptionComponent,
  detailsViewComponent,
  topicConf,
  renderRootPage = true
}: GlobalSearchPageRoutesOptions): RouteRecordRaw => {
  const pageConf = pageConfOverride ?? usePageConf(pageKey)
  const objectType = pageConf.object_type
  const root = basePath ?? `/${pageKey}`
  const { searchConfig, customFilters } = buildGlobalSearchConfig(pageKey, {
    pageConf: pageConfOverride,
    siblingPages
  })

  const defaultDetailsViews: Record<PageObjectType, () => Promise<unknown>> = {
    dataservices: () =>
      import('@/views/dataservices/DataserviceDetailView.vue'),
    topics: () => import('@/views/topics/TopicDetailView.vue'),
    datasets: () => import('@/views/datasets/DatasetDetailView.vue')
  }

  const childrenPages = {
    path: renderRootPage ? ':item_id' : `${root}/:item_id`,
    name: `${pageKey}_detail`,
    component: detailsViewComponent ?? defaultDetailsViews[objectType],
    meta: {
      pageKey,
      pageConf: pageConfOverride,
      activeMenuLink,
      parentBreadcrumb,
      descriptionComponent,
      cardComponent,
      datasetCardComponent
    },
    // this forces the component to be recreated when switching page type
    props: () => ({ key: pageKey, ...topicConf })
  }

  const rootPage = {
    path: root,
    children: [
      {
        path: '',
        name: pageKey,
        meta: {
          title: pageConf.meta?.title ?? pageConf.title,
          pageKey,
          pageConf: pageConfOverride,
          activeMenuLink,
          parentBreadcrumb,
          cardComponent,
          searchType: objectType,
          searchConfig,
          customFilters
        },
        component: () => import('@/views/UnifiedSearchView.vue'),
        // forces the component to be recreated when navigating to a different pageKey
        props: () => ({ key: pageKey })
      },
      childrenPages
    ]
  }

  return renderRootPage ? rootPage : childrenPages
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
    },
    {
      path: `/admin/${pageKey}/drafts`,
      name: `${pageKey}_drafts`,
      component: async () => await import('@/views/topics/TopicDraftsView.vue'),
      meta: { requiresAuth: true, title: 'Mes brouillons', pageKey }
    }
  ]
}

// Org detail stays at /organizations/:oid; activeMenuLink highlights "Contributeurs" for it.
export const useOrganizationsRoutes = (): RouteRecordRaw => {
  return {
    path: '/organizations',
    // no name: the '' child is unnamed too, and naming only the parent trips a Vue Router warning
    children: [
      { path: '', redirect: '/contributors' },
      {
        path: ':oid',
        name: 'organization_detail',
        component: async () =>
          await import('@/views/organizations/OrganizationDetailView.vue'),
        meta: { activeMenuLink: '/contributors' }
      }
    ]
  }
}

/**
 * Builds routes for one network (SIF): a redirect from the bare /contributors/<slug>
 * to its default (first-listed) page, plus one GlobalSearch route per page in
 * network.pages, all nested under /contributors/<slug>/<subpath> and bundled into
 * a shared type switcher.
 */
export const useNetworkRoutes = (
  slug: string,
  network: NetworkConf
): RouteRecordRaw[] => {
  const base = `/contributors/${slug}`
  const subpaths = Object.keys(network.pages)
  const defaultSubpath = subpaths[0]
  const siblingPages = Object.fromEntries(
    subpaths.map((subpath) => [`${slug}__${subpath}`, network.pages[subpath]])
  )
  const organizationsConfig = config.organizations as OrganizationsConfig
  const parentBreadcrumb = {
    to: '/contributors',
    text: organizationsConfig.page?.breadcrumb_title ?? 'Contributeurs'
  }

  return [
    { path: base, redirect: `${base}/${defaultSubpath}` },
    ...subpaths.map((subpath) =>
      useGlobalSearchPageRoutes({
        pageKey: `${slug}__${subpath}`,
        pageConf: network.pages[subpath],
        basePath: `${base}/${subpath}`,
        siblingPages,
        activeMenuLink: '/contributors',
        parentBreadcrumb
      })
    )
  ]
}

export const useContributorsRoutes = (): RouteRecordRaw[] => {
  const networks = useNetworksConf()
  return [
    {
      path: '/contributors',
      name: 'contributors',
      meta: { activeMenuLink: '/contributors' },
      component: async () =>
        await import('@/views/organizations/ContributorsListView.vue')
    },
    ...Object.entries(networks).flatMap(([slug, network]) =>
      useNetworkRoutes(slug, network)
    )
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
    pageConf: meta.pageConf ?? usePageConf(meta.pageKey)
  }
}
