import type { SiteId } from './topic'

export interface CanAddTopicsConf {
  everyone: boolean
  authorized_users: string[]
}

export interface TopicsConf {
  slug: string
  name: string
  extras_key: SiteId
  themes: {
    usage: boolean
    main_name: string
    secondary_name: string
  }
  list_all: boolean
  display_metadata: boolean
  activate_read_more: boolean
  dataset_editorialization: boolean
  can_add_topics: CanAddTopicsConf
  show_drafts_by_default: boolean
}

export interface TopicItemConf {
  id: string
  name: string
}

export interface StaticPageConfig {
  title: string
  id: string
  route: string
  url: string
}

export interface MenuConfig {
  text: string
  to: string
}

export interface PageFilterValueConf {
  id: string
  name: string
  parent?: string
}

export interface PageFilterConf {
  name: string
  id: string
  type: 'spatial_zone' | 'spatial_granularity' | 'select'
  child?: string
  color: string
  default_option: string
  use_tag_prefix: boolean
  values: PageFilterValueConf[]
}

export type PageUniverseQueryConf = {
  [key: string]: string | number | boolean
}

export type PageBannerConf = {
  title: string
  content: string
}

export type PageSearchConf = {
  input: string
  results: {
    one: string
    several: string
  }
}

export type PageConf = {
  tag_prefix: string
  universe_query: PageUniverseQueryConf
  title: string
  breadcrumb_title: string | null
  search: PageSearchConf
  banner: PageBannerConf | null
  filters: PageFilterConf[]
}

export type PagesConf = {
  [key: string]: PageConf
}
