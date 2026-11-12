import config from '@/config'
import type {
  DatasetsConf,
  NetworkConf,
  NetworkEntriesConf,
  NetworksConf,
  PagesConf,
  TopicsConf,
  WebsiteConfig
} from '@/model/config'
import type { SiteId } from '@/model/topic'

export const usePagesConf = (): PagesConf => config.pages

export const useNetworksConf = (): NetworksConf => {
  const networks = config.networks ?? {}
  return { ...networks, entries: networks.entries ?? {} }
}

export const useNetworksEntries = (): NetworkEntriesConf =>
  useNetworksConf().entries

// Route name for a network page, e.g. `datasets` under network `acme`. Shared
// convention between router setup (useNetworkRoutes) and every place that
// links to a network page.
export const networkRouteName = (slug: string, subpath: string): string =>
  `${slug}__${subpath}`

// Route name for a network's bare root, which redirects to its default subpath.
export const networkBaseRouteName = (slug: string): string => `${slug}__base`

// The first page listed for a network is its default (redirect target + display identity)
export const networkDefaultPage = (network: NetworkConf) => {
  const subpath = Object.keys(network.pages)[0]
  return { subpath, page: network.pages[subpath] }
}

// Organizations list URL for a page key, plain or network (`${slug}__${subpath}`, see networkRouteName).
export const organizationsConfigUrl = (pageKey: string): string | undefined => {
  const [slug, subpath] = pageKey.split('__')
  return subpath === undefined
    ? config.organizations?.[pageKey]
    : useNetworksEntries()[slug]?.organizations?.[subpath]
}

export const useTopicsConf = (): TopicsConf => {
  const topicsConf: TopicsConf = config.website.topics
  return topicsConf
}

// Get debounce value or set default.
export const debounceWait: number = config.website.default_debounce_wait ?? 600

export const usePageConf = (pageId: string) => {
  const pagesConf: PagesConf = config.pages
  if (!(pageId in pagesConf)) {
    throw new Error(
      `Invalid page key: ${pageId}. Available pages: ${Object.keys(pagesConf).join(', ')}`
    )
  }
  return pagesConf[pageId]
}

export const useDatasetsConf = () => {
  const datasetsConf: DatasetsConf = config.website.datasets
  return datasetsConf
}

export const useSiteId = () => {
  return config.site_id as SiteId
}

export const useWebsiteConfig = (): WebsiteConfig => config.website
