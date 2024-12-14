import type { SiteId } from './topic'

export interface CanAddElementConf {
  everyone: boolean
  authorized_users: string[]
}

export interface SearchConf {
  name: string
  slug: string
  type: string
  organizations: Array<string>
  extras_key: SiteId
  list_all: boolean
  display_metadata: boolean
  activate_read_more: boolean
  dataset_editorialization: boolean
  can_add: CanAddElementConf
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
