export interface TopicsConf {
  can_add_topics: {
    everyone: boolean
    authorized_users: string[]
  }
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

export interface PageFilterFormConf {
  required: boolean
}

export interface PageFilterConf {
  name: string
  id: string
  type:
    | 'spatial_zone'
    | 'spatial_granularity'
    | 'select'
    | 'checkbox'
    | 'organization'
  child: string | null
  color: string | null
  default_option: string | null
  default_value: string | boolean | null
  use_filter_prefix: boolean | null
  api_param: string | null
  form: PageFilterFormConf | null
  authenticated: boolean | null
  hide_on_list: boolean | null
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
}

export type PageLabelsConf = {
  singular: string
  plural: string
  extended: string
}

export type PageConf = {
  list_all: boolean
  filter_prefix: string | null
  universe_query: PageUniverseQueryConf | null
  title: string
  breadcrumb_title: string | null
  labels: PageLabelsConf
  search: PageSearchConf
  banner: PageBannerConf | null
  default_sort: string | null
  resources_tabs: {
    discussions: {
      display: boolean
      create: boolean
    }
    datasets: {
      display: boolean
    }
    reuses: {
      display: boolean
    }
  }
  editable: boolean
  filters: PageFilterConf[]
}

export type PagesConf = {
  [key: string]: PageConf
}

export type DatasetsConf = {
  add_to_topic: {
    page: string
    dataset_editorialization: boolean
  } | null
  harvest_backends_quality_warning: string[]
  show_extended_information_panel: boolean
}

// https://docs.sentry.io/platforms/javascript/guides/vue/configuration/options/
export type SentryConfig = {
  dsn: string // Mandatory to send errors to Sentry
  domain_url?: string // Mandatory to send sourcemaps to Sentry. This is not used in sentry options, it is only used in vite.config.mts to send sourcemaps to the correct domain.
  environment?: string
  tracePropagationTargets?: RegExp[]
  tracesSampleRate?: number
  replaysSessionSampleRate?: number
  replaysOnErrorSampleRate?: number
}
