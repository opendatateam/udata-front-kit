import config from '@/config'
import type { TopicsConf, ScopeAddTopicsConf } from '@/model/config'
import type { SiteId } from '@/model/topic'

interface TopicsConfNormalized {
  topicName: string
  topicSlug: string
  topicExtrasKey: SiteId
  useThemes: boolean
  mainTheme: string
  secondaryTheme: string
  datasetEditorialization: boolean
  scopeAddTopics: ScopeAddTopicsConf
  pageAllTopics: boolean
  displayMetadata: boolean
  activateReadMore: boolean
}

export const useTopicsConf = (): TopicsConfNormalized => {
  const topicsConf = config.website.topics as TopicsConf
  return {
    topicName: topicsConf.topic_name.name,
    topicSlug: topicsConf.topic_name.slug,
    topicExtrasKey: topicsConf.extras_key,
    useThemes: topicsConf.themes.usage,
    mainTheme: topicsConf.themes.main_name,
    secondaryTheme: topicsConf.themes.secondary_name,
    datasetEditorialization: topicsConf.dataset_editorialization,
    scopeAddTopics: topicsConf.scope_add_topics,
    pageAllTopics: topicsConf.page_all_topics,
    displayMetadata: topicsConf.display_metadata,
    activateReadMore: topicsConf.activate_read_more
  }
}
