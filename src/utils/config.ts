import config from '@/config'
import type { TopicsConf, ScopeAddTopicsConf } from '@/model/config'
import type { SiteId } from '@/model/topic'

interface TopicsConfNormalized {
  topicName: string
  topicSlug: string
  extrasToProcess: SiteId
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
    topicName: config.website.topics.topic_name.name,
    topicSlug: topicsConf.topic_name.slug,
    extrasToProcess: config.website.topics.extras_to_process,
    useThemes: config.website.topics.themes.usage,
    mainTheme: config.website.topics.themes.main_name,
    secondaryTheme: config.website.topics.themes.secondary_name,
    datasetEditorialization: config.website.topics.dataset_editorialization,
    scopeAddTopics: config.website.topics.scope_add_topics,
    pageAllTopics: config.website.topics.page_all_topics,
    displayMetadata: config.website.topics.display_metadata,
    activateReadMore: config.website.topics.activate_read_more
  }
}
