import config from '@/config'
import type {
  DatasetsConf,
  NetworkConf,
  NetworksConf,
  PagesConf,
  TopicsConf,
  WebsiteConfig
} from '@/model/config'
import type { SiteId } from '@/model/topic'

export const usePagesConf = (): PagesConf => config.pages

export const useNetworksConf = (): NetworksConf => {
  // `tag` is a reserved key on `networks`, not a network slug
  const { tag: _tag, ...networks } = config.networks ?? {}
  return networks
}

export const useNetworksTag = (): string | null => config.networks?.tag ?? null

// Route name for a network page, e.g. `datasets` under network `acme`. Shared
// convention between router setup (useNetworkRoutes) and every place that
// links to a network page.
export const networkRouteName = (slug: string, subpath: string): string =>
  `${slug}__${subpath}`

// The first page listed for a network is its default (redirect target + display identity)
export const networkDefaultPage = (network: NetworkConf) => {
  const subpath = Object.keys(network.pages)[0]
  return { subpath, page: network.pages[subpath] }
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
