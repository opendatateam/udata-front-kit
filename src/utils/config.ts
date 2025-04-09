import config from '@/config'
import type {
  CanAddTopicsConf,
  DatasetsConf,
  PagesConf,
  TopicsConf
} from '@/model/config'
import type { SiteId } from '@/model/topic'

interface TopicsConfNormalized {
  topicsName: string
  topicsSlug: string
  topicsExtrasKey: SiteId
  topicsUseThemes: boolean
  topicsMainTheme: string
  topicsSecondaryTheme: string
  topicsDatasetEditorialization: boolean
  topicsCanAdd: CanAddTopicsConf
}

export const useTopicsConf = (): TopicsConfNormalized => {
  const topicsConf = config.website.topics as TopicsConf
  return {
    topicsName: topicsConf.name,
    topicsSlug: topicsConf.slug,
    topicsExtrasKey: topicsConf.extras_key,
    topicsUseThemes: topicsConf.themes.usage,
    topicsMainTheme: topicsConf.themes.main_name,
    topicsSecondaryTheme: topicsConf.themes.secondary_name,
    topicsDatasetEditorialization: topicsConf.dataset_editorialization,
    topicsCanAdd: topicsConf.can_add_topics
  }
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
