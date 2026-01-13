import type { DatasetV2 } from '@datagouv/components-next'
import { build, sequence } from 'mimicry-js'
import { dinumOrganization } from './organizations_factory'

// factory expands payload with the dynamic fields we need
export const datasetFactory = build<DatasetV2>({
  fields: {
    // "static" fields
    title:
      "Part des véhicules à faibles émissions dans le renouvellement d'un parc (organisation OFFICE PUBLIC DE L'HABITAT DU DEPARTEMENT DU DOUBS)",
    acronym: 'XXX',
    description:
      'Ce jeu de données répond aux spécifications du schéma "Part des véhicules à faibles émissions dans le renouvellement d\'un parc" disponible sur le site [schema.data.gouv.fr](https://schema.data.gouv.fr/etalab/schema-vehicules-faibles-emissions-renouvellement-parc)',
    description_short: '',
    created_at: '2025-09-24T08:35:58.525000+00:00',
    last_modified: '2025-09-24T08:35:59.477000+00:00',
    deleted: null,
    private: false,
    tags: [],
    badges: [],
    frequency: 'unknown',
    frequency_date: null,
    extras: {},
    metrics: {
      discussions: 0,
      discussions_open: 0,
      reuses: 0,
      dataservices: 0,
      followers: 0,
      views: 0,
      resources_downloads: 0
    },
    temporal_coverage: null,
    owner: null,
    spatial: null,
    license: 'notspecified',
    last_update: '2025-09-24T08:35:59.477000+00:00',
    archived: false,
    quality: {
      license: false,
      temporal_coverage: false,
      spatial: false,
      update_frequency: false,
      dataset_description_quality: true,
      has_resources: true,
      has_open_format: true,
      all_resources_available: true,
      resources_documentation: false,
      score: 0.333333333333333,
      update_fulfilled_in_time: false
    },
    harvest: null,
    internal: {
      created_at_internal: '2025-09-24T08:35:58.525000+00:00',
      last_modified_internal: '2025-09-24T08:35:59.477000+00:00'
    },
    contact_points: [],
    featured: false,
    permissions: {
      delete: true,
      edit: true,
      edit_resources: true
    },
    // factory fields
    organization: dinumOrganization,
    id: sequence((x) => `dataset_id_${x}`),
    slug: sequence((x) => `dataset_slug_${x}`),
    uri: sequence(
      (x) => `https://www.data.gouv.fr/api/2/datasets/topic_slug_${x}/`
    ),
    page: sequence((x) => `https://www.data.gouv.fr/datasets/topic_slug_${x}/`),
    resources: sequence((x) => {
      return {
        rel: 'subsection',
        href: `https://www.data.gouv.fr/api/2/datasets/dataset_id_${x}/resources/?page=1&page_size=50`,
        type: 'GET',
        total: 0
      }
    }),
    community_resources: sequence((x) => {
      return {
        rel: 'subsection',
        href: `https://www.data.gouv.fr/api/1/datasets/community_resources/?dataset=dataset_id_${x}&page=1&page_size=50`,
        type: 'GET',
        total: 0
      }
    })
  }
})
