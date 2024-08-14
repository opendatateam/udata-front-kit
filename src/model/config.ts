import type { SiteId } from './topic'

export interface ScopeAddTopicsConf {
  all: boolean
  authorized_users: string[]
}

export interface TopicsConf {
  topic_name: {
    slug: string
    name: string
  }
  extras_key: SiteId
  themes: {
    usage: boolean
    main_name: string
    secondary_name: string
  }
  page_all_topics: boolean
  display_metadata: boolean
  activate_read_more: boolean
  dataset_editorialization: boolean
  scope_add_topics: ScopeAddTopicsConf
}

export interface TopicItemConf {
  id: string
  name: string
}

export interface PageConfig {
  title: string
  id: string
  route: string
  url: string
}

export interface MenuConfig {
  text: string
  to: string
}
