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

var hasLoggedBaseUrl = false
export const useBaseUrl = () => {
  var env = import.meta.env.MODE

  if (
    env === 'production' &&
    window.location.hostname.match(/(preprod|demo)\.data\.gouv\.fr$/)
  ) {
    env = 'demo'
  }

  if (!hasLoggedBaseUrl) {
    console.info(`Use environment '${env}' to determine base_url`)
  }

  if (config.datagouvfr[env]) {
    const url = config.datagouvfr[env].base_url
    if (!hasLoggedBaseUrl) {
      console.info(`Use base_url '${url}' specified for environment '${env}'`)
      hasLoggedBaseUrl = true
    }
    return url
  }

  if (!hasLoggedBaseUrl) {
    console.info(`Use default base_url '${config.datagouvfr.base_url}'`)
    hasLoggedBaseUrl = true
  }
  return config.datagouvfr.base_url
}
