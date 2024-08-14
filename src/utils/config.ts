import config from '@/config'
import type { TopicsConf, CanAddTopicsConf } from '@/model/config'
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
  pageAllTopics: boolean
  topicsDisplayMetadata: boolean
  topicsActivateReadMore: boolean
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
    topicsDatasetEditorialization: topicsConf.dataset_editorialization,
    topicsCanAdd: topicsConf.can_add_topics,
    pageAllTopics: topicsConf.page_all_topics,
    topicsDisplayMetadata: topicsConf.display_metadata,
    topicsActivateReadMore: topicsConf.activate_read_more
  }
}
