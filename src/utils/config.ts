import config from '@/config'
import type { DatasetsConf, PagesConf, TopicsConf } from '@/model/config'
import type { SiteId } from '@/model/topic'

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

export const useDatagouvfrConfig = () => {
  const env = import.meta.env.MODE

  if (config.datagouvfr[env]) {
    return config.datagouvfr[env]
  }

  return config.datagouvfr
}
