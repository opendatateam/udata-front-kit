import type { BuiltInFilterKey } from '@datagouv/components-next'

export const CUSTOM_FILTER_TYPES = ['select', 'organization_custom'] as const
export type CustomFilterType = (typeof CUSTOM_FILTER_TYPES)[number]

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
  meta?: {
    title?: string
    description?: string
  }
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
  type: CustomFilterType | BuiltInFilterKey
  advanced?: boolean
  // Page keys this filter applies to in multi-type search. Defaults to the owning page only.
  applies_to_pages?: string[]
  child: string | null
  color: string | null
  default_option: string | null
  default_value: string | boolean | null
  use_filter_prefix: boolean | null
  api_param: string | null
  form: PageFilterFormConf | null
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
  placeholder?: string | null
}

export type PageLabelsConf = {
  singular: string
  plural: string
  extended: string
  feminine?: boolean
}

export type PageObjectType = 'datasets' | 'dataservices' | 'topics'

export type PageConf = {
  object_type: PageObjectType
  list_all: boolean
  filter_prefix: string | null
  universe_query: PageUniverseQueryConf | null
  title: string
  breadcrumb_title: string | null
  icon?: string
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
  meta?: {
    title?: string
    description?: string
  }
  filters: PageFilterConf[]
}

export type PagesConf = {
  [key: string]: PageConf
}

export type DatasetsConf = {
  add_to_topic: {
    page: string
  } | null
  harvest_backends_quality_warning: string[]
  show_extended_information_panel: boolean
}

export type HeaderSearchConf = {
  display: boolean
  placeholder?: string
}

export interface WebsiteConfig {
  title: string
  seo?: {
    canonical_url?: string
    meta?: {
      keywords?: string
      description?: string
      robots?: string
    }
  }
  header: {
    search: HeaderSearchConf
  }
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

export type OrganizationsConfig = {
  datasets?: string
  dataservices?: string
  bouquets?: string
  page?: {
    breadcrumb_title?: string
    labels?: {
      singular?: string
    }
    meta?: {
      title?: string
      description?: string
    }
  }
}
