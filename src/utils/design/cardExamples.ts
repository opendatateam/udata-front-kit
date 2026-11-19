import type {
  Dataservice,
  DatasetV2,
  Organization,
  OrganizationReference,
  Quality,
  Reuse
} from '@datagouv/components-next'

import { dataserviceFactory } from '@/fixtures/factories/dataservices_factory'
import { datasetFactory } from '@/fixtures/factories/datasets_factory'
import { organizationFactory } from '@/fixtures/factories/organizations_factory'
import { reuseFactory } from '@/fixtures/factories/reuses_factory'
import { topicFactory } from '@/fixtures/factories/topics_factory'
import type { Topic } from '@/model/topic'
import { usePageConf, usePagesConf } from '@/utils/config'
import { useFilterValue } from '@/utils/filters'

export interface CardExample<T> {
  label: string
  data: T
  showDescription?: boolean
}

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
export const illustration = svg(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="#e3f2ed"/><path d="M0 60 640 240M80 0 500 360M0 280 640 80" stroke="white" stroke-width="28"/><path d="M80 280 220 180 390 230 540 80" fill="none" stroke="#000091" stroke-width="8"/></svg>'
)

// keeps fictional cards links inside the gallery
export const galleryUrl = { name: 'design_cards' }

const organization = (name: string, badges: string[], withLogo: boolean) =>
  organizationFactory.one({
    overrides: {
      name,
      acronym: null,
      page,
      logo: withLogo ? logo : '',
      logo_thumbnail: withLogo ? logo : '',
      badges: badges.map((kind) => ({ kind })),
      description,
      metrics: { datasets: 1240, dataservices: 12, reuses: 37, followers: 2400 }
    },
    postBuild: (built) => ({ ...built, class: 'Organization' as const })
  })

const publicOrganization = organization(
  'Observatoire des territoires',
  ['public-service', 'certified'],
  true
)
const localOrganization = organization(
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

const ownedByOrganization = { organization: publicOrganization, owner: null }

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

export const exampleDataset: DatasetV2 = datasetFactory.one({
  overrides: {
    ...ownedByOrganization,
    title: 'Aménagements cyclables',
    acronym: '',
    description,
    description_short: description,
    page,
    quality,
    metrics: {
      dataservices: 3,
      followers: 120,
      resources_downloads: 42500,
      reuses: 18,
      views: 1250000
    }
  }
})

export const exampleDatasets: CardExample<DatasetV2>[] = [
  { label: 'Qualité complète, métriques élevées', data: exampleDataset },
  {
    label: 'Titre long, qualité incomplète',
    data: {
      ...exampleDataset,
      id: 'demo-dataset-long',
      title: longTitle,
      organization: localOrganization,
      owner: null,
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
    label: 'Brouillon',
    data: {
      ...exampleDataset,
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

const dataservice: Dataservice = dataserviceFactory.one({
  overrides: {
    ...ownedByOrganization,
    title: 'API des mobilités',
    acronym: '',
    description,
    availability: 99.9,
    metrics: { followers: 42, reuses: 8, views: 24300 },
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
    }
  }
})

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
      organization: localOrganization,
      owner: null
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

const reuse: Reuse = reuseFactory.one({
  overrides: {
    ...ownedByOrganization,
    title: 'Les mobilités en cartes',
    description,
    topic: 'transport_and_mobility',
    url: page,
    image: illustration,
    image_thumbnail: illustration,
    metrics: { datasets: 4, followers: 340, views: 98700 },
    page
  }
})

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
  // the factory has no elements nor spatial coverage: the card footer won't query the API
  const topic: Topic = topicFactory.one({
    overrides: {
      ...ownedByOrganization,
      name: 'Se déplacer à vélo',
      description,
      last_modified: '2026-01-12T12:00:00+00:00',
      page,
      tags: exampleTagsForPage(pageKey)
    }
  })
  return [
    { label: 'Publié par une organisation', data: topic },
    {
      label: 'Titre long, sans tags ni description',
      data: { ...topic, id: 'demo-topic-long', name: longTitle, tags: [] },
      showDescription: false
    }
  ]
}
