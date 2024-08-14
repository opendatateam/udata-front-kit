import config from '@/config'
import type { TopicsConf, ScopeAddTopicsConf } from '@/model/config'
import type { SiteId } from '@/model/topic'

interface TopicsConfNormalized {
  topicsName: string
  topicsSlug: string
  topicsExtrasKey: SiteId
  topicsUseThemes: boolean
  topicsMainTheme: string
  topicsSecondaryTheme: string
  datasetEditorialization: boolean
  scopeAddTopics: ScopeAddTopicsConf
  pageAllTopics: boolean
  displayMetadata: boolean
  activateReadMore: boolean
}

export const useTopicsConf = (): TopicsConfNormalized => {
  const topicsConf = config.website.topics as TopicsConf
  return {
    topicsName: topicsConf.topic_name.name,
    topicsSlug: topicsConf.topic_name.slug,
    topicsExtrasKey: topicsConf.extras_key,
    topicsUseThemes: topicsConf.themes.usage,
    topicsMainTheme: topicsConf.themes.main_name,
    topicsSecondaryTheme: topicsConf.themes.secondary_name,
    datasetEditorialization: topicsConf.dataset_editorialization,
    scopeAddTopics: topicsConf.scope_add_topics,
    pageAllTopics: topicsConf.page_all_topics,
    displayMetadata: topicsConf.display_metadata,
    activateReadMore: topicsConf.activate_read_more
  }
}
