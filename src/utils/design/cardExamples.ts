import type {
  Dataservice,
  DatasetV2,
  Organization,
  OrganizationReference,
  Quality,
  Reuse,
  UserReference
} from '@datagouv/components-next'
import type { RouteLocationRaw } from 'vue-router'

import type { Topic, TopicExtras } from '@/model/topic'
import { usePageConf, usePagesConf } from '@/utils/config'
import { useFilterValue } from '@/utils/filters'

export interface CardExample<T> {
  label: string
  data: T
  showDescription?: boolean
}

const date = '2026-01-12T12:00:00+00:00'
const page = '/_design/cards'
const description =
  'Des données ouvertes pour comprendre les territoires, comparer les usages et construire de nouveaux services. Cette description volontairement longue permet de vérifier la limitation du nombre de lignes et la lisibilité de la carte.'
const longTitle =
  'Inventaire des équipements et des services publics accessibles dans les communes et intercommunalités du territoire national'

const svg = (content: string) =>
  `data:image/svg+xml,${encodeURIComponent(content)}`
const logo = svg(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#ececfe"/><path d="M12 45 32 12l20 33H12Zm13-7h14l-7-12-7 12Z" fill="#000091"/></svg>'
)
const avatar = svg(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#e3f2ed"/><circle cx="32" cy="24" r="12" fill="#18753c"/><path d="M10 64c0-16 10-24 22-24s22 8 22 24Z" fill="#18753c"/></svg>'
)
export const illustration = svg(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="#e3f2ed"/><path d="M0 60 640 240M80 0 500 360M0 280 640 80" stroke="white" stroke-width="28"/><path d="M80 280 220 180 390 230 540 80" fill="none" stroke="#000091" stroke-width="8"/></svg>'
)

// keeps fictional cards links inside the gallery
export const galleryUrl = (section: string): RouteLocationRaw => ({
  name: 'design_cards',
  hash: `#${section}`
})

const organization = (
  id: string,
  name: string,
  badges: string[],
  withLogo: boolean
): Organization & OrganizationReference => ({
  class: 'Organization',
  id,
  name,
  acronym: null,
  slug: id,
  uri: '',
  page,
  logo: withLogo ? logo : '',
  logo_thumbnail: withLogo ? logo : '',
  badges: badges.map((kind) => ({ kind })),
  permissions: {
    delete: false,
    edit: false,
    harvest: false,
    members: false,
    private: false
  },
  url: '',
  description,
  business_number_id: '',
  created_at: date,
  last_modified: date,
  deleted: null,
  extras: {},
  members: [],
  metrics: {
    datasets: 1240,
    datasets_by_months: {},
    dataservices: 12,
    dataservices_by_months: {},
    reuses: 37,
    reuses_by_months: {},
    followers: 2400,
    members: 8,
    views: 120000
  }
})

const publicOrganization = organization(
  'demo-public',
  'Observatoire des territoires',
  ['public-service', 'certified'],
  true
)
const localOrganization = organization(
  'demo-local',
  'Communauté de communes des vallées et des plateaux, service des données et de la transition écologique',
  ['local-authority'],
  false
)

export const exampleOrganizations: CardExample<
  Organization & OrganizationReference
>[] = [
  { label: 'Service public certifié, avec logo', data: publicOrganization },
  { label: 'Collectivité, nom long et sans logo', data: localOrganization }
]

const user: UserReference = {
  class: 'User',
  id: 'demo-user',
  first_name: 'Camille',
  last_name: 'Martin',
  slug: 'demo-user',
  uri: '',
  page,
  avatar,
  avatar_thumbnail: avatar
}

const ownedByOrganization = { organization: publicOrganization, owner: null }
const ownedByUser = { organization: null, owner: user }

const rel = { rel: 'subsection', href: '', total: 0, type: 'GET' }

const quality: Quality = {
  score: 1,
  dataset_description_quality: true,
  resources_documentation: true,
  license: true,
  update_frequency: true,
  update_fulfilled_in_time: true,
  has_open_format: true,
  temporal_coverage: true,
  spatial: true,
  all_resources_available: true
}

export const exampleDataset: DatasetV2 = {
  ...ownedByOrganization,
  id: 'demo-dataset',
  slug: 'demo-dataset',
  title: 'Aménagements cyclables',
  acronym: '',
  archived: false,
  description,
  description_short: description,
  tags: [],
  license: 'lov2',
  frequency: 'monthly',
  temporal_coverage: null,
  frequency_date: null,
  page,
  private: false,
  spatial: null,
  contact_points: [],
  featured: false,
  badges: [],
  deleted: null,
  doi: null,
  resources: rel,
  community_resources: rel,
  created_at: date,
  last_modified: date,
  last_update: date,
  internal: { created_at_internal: date, last_modified_internal: date },
  uri: '',
  quality,
  metrics: {
    dataservices: 3,
    discussions: 0,
    discussions_open: 0,
    followers: 120,
    resources_downloads: 42500,
    reuses: 18,
    views: 1250000
  },
  harvest: null,
  extras: {},
  permissions: { edit: false, edit_resources: false, delete: false },
  access_type: 'open',
  access_audiences: [],
  access_type_reason: null,
  access_type_reason_category: null,
  authorization_request_url: null
}

export const exampleDatasets: CardExample<DatasetV2>[] = [
  { label: 'Qualité complète, métriques élevées', data: exampleDataset },
  {
    label: 'Titre long, qualité incomplète',
    data: {
      ...exampleDataset,
      id: 'demo-dataset-long',
      title: longTitle,
      organization: localOrganization,
      quality: {
        ...quality,
        score: 0.33,
        resources_documentation: false,
        spatial: false,
        temporal_coverage: false,
        update_fulfilled_in_time: false
      }
    }
  },
  {
    label: 'Brouillon, publié par un utilisateur',
    data: {
      ...exampleDataset,
      ...ownedByUser,
      id: 'demo-dataset-draft',
      title: 'Budget participatif, édition 2026',
      private: true
    }
  },
  {
    label: 'Archivé',
    data: {
      ...exampleDataset,
      id: 'demo-dataset-archived',
      title: 'Archives des comptages routiers',
      archived: true
    }
  },
  {
    label: 'Sans description',
    data: { ...exampleDataset, id: 'demo-dataset-compact' },
    showDescription: false
  }
]

const dataservice: Dataservice = {
  ...ownedByOrganization,
  id: 'demo-api',
  slug: 'demo-api',
  title: 'API des mobilités',
  acronym: '',
  archived_at: null,
  availability: 99.9,
  base_api_url: null,
  contact_points: [],
  created_at: date,
  datasets: { href: '', rel: 'subsection', total: 2, type: 'GET' },
  deleted_at: null,
  description,
  featured: false,
  machine_documentation_url: null,
  technical_documentation_url: null,
  business_documentation_url: null,
  extras: {},
  format: '',
  harvest: null,
  license: 'lov2',
  metadata_modified_at: date,
  metrics: {
    discussions: 0,
    discussions_open: 0,
    followers: 42,
    reuses: 8,
    views: 24300
  },
  permissions: { edit: false, delete: false },
  private: false,
  rate_limiting: '',
  rate_limiting_url: null,
  self_api_url: '',
  self_web_url: page,
  tags: [],
  quality: {
    score: 1,
    has_description: true,
    has_machine_documentation: true,
    has_technical_documentation: true,
    has_business_documentation: true,
    license: true,
    has_contact_point: true,
    has_base_api_url: true,
    availability_documented: true,
    rate_limiting_documented: true,
    access_conditions_clear: true
  },
  access_type: 'open',
  access_audiences: [],
  access_type_reason: null,
  access_type_reason_category: null,
  authorization_request_url: null
}

export const exampleDataservices: CardExample<Dataservice>[] = [
  { label: 'Accès ouvert', data: dataservice },
  {
    label: 'Accès avec un compte, titre long',
    data: {
      ...dataservice,
      id: 'demo-api-account',
      title: longTitle,
      access_type: 'open_with_account'
    }
  },
  {
    label: 'Accès restreint, organisation sans logo',
    data: {
      ...dataservice,
      id: 'demo-api-restricted',
      title: 'API des demandes administratives',
      access_type: 'restricted',
      organization: localOrganization
    }
  },
  {
    label: 'Brouillon',
    data: {
      ...dataservice,
      id: 'demo-api-draft',
      title: 'API expérimentale',
      private: true
    }
  },
  {
    label: 'Sans description',
    data: { ...dataservice, id: 'demo-api-compact' },
    showDescription: false
  }
]

const reuse: Reuse = {
  ...ownedByOrganization,
  id: 'demo-reuse',
  slug: 'demo-reuse',
  title: 'Les mobilités en cartes',
  description,
  tags: [],
  datasets: [],
  dataservices: [],
  topic: 'transport_and_mobility',
  type: 'application',
  url: page,
  private: false,
  badges: [],
  created_at: date,
  archived: null,
  deleted: null,
  extras: {},
  featured: false,
  image: illustration,
  image_thumbnail: illustration,
  last_modified: date,
  metrics: {
    datasets: 4,
    discussions: 0,
    discussions_open: 0,
    followers: 340,
    views: 98700
  },
  page,
  uri: '',
  permissions: { edit: false, delete: false }
}

export const exampleReuses: CardExample<Reuse>[] = [
  { label: 'Avec illustration', data: reuse },
  {
    label: 'Sans image, titre long',
    data: {
      ...reuse,
      id: 'demo-reuse-long',
      title: longTitle,
      image: null,
      image_thumbnail: null
    }
  }
]

export const exampleSubsection = {
  cards: [
    {
      name: 'Une actualité avec image et badge',
      description,
      url: `${page}#subsections`,
      image_url: illustration,
      badges: [{ label: 'Actualité', noIcon: true }]
    },
    {
      name: 'Une actualité sans image',
      description,
      url: `${page}#subsections`
    }
  ]
}

export const findTopicsPageKey = (): string | undefined =>
  Object.entries(usePagesConf()).find(
    ([, pageConf]) => pageConf.object_type === 'topics'
  )?.[0]

// one tag per select filter of the page, so that badges render on every site
export const exampleTagsForPage = (pageKey: string): string[] =>
  usePageConf(pageKey)
    .filters.filter((f) => f.type === 'select' && f.values.length > 0)
    .map((f) =>
      useFilterValue(pageKey, f.id, f.values[0].id, !!f.use_filter_prefix)
    )

export const exampleTopics = (pageKey: string): CardExample<Topic>[] => {
  // no elements nor spatial coverage: the card footer would query the API
  const topic: Topic = {
    ...ownedByOrganization,
    id: 'demo-topic',
    slug: 'demo-topic',
    name: 'Se déplacer à vélo',
    description,
    created_at: date,
    last_modified: date,
    extras: {} as TopicExtras,
    featured: false,
    page,
    private: false,
    elements: rel,
    tags: exampleTagsForPage(pageKey),
    uri: '',
    spatial: undefined
  }
  return [
    { label: 'Publié par une organisation', data: topic },
    {
      label: 'Titre long, sans tags ni description',
      data: { ...topic, id: 'demo-topic-long', name: longTitle, tags: [] },
      showDescription: false
    }
  ]
}
