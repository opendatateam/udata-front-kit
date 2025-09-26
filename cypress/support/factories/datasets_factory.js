import { build, sequence } from 'mimicry-js'
import { dinumOrganization } from './organizations_factory'

const datasetFactory = build({
  fields: {
    organization: dinumOrganization,
    title: 'Sample Dataset',
    description: 'Sample dataset description',
    created_at: '2025-07-28T12:03:28.390000+00:00',
    last_modified: '2025-07-28T14:03:44.363000+00:00',
    id: sequence((x) => `dataset_id_${x}`),
    slug: sequence((x) => `dataset_slug_${x}`),
    tags: ['sample-tag'],
    uri: sequence((x) => `/api/2/datasets/dataset_slug_${x}/`),
    page: sequence(
      (x) => `https://demo.data.gouv.fr/datasets/dataset_slug_${x}/`
    ),
    acronym: null,
    archived: null,
    badges: [],
    contact_point: null,
    deleted: null,
    extras: {},
    featured: false,
    frequency: 'unknown',
    frequency_date: null,
    harvest: null,
    last_update: '2025-07-28T14:03:44.363000+00:00',
    license: {
      id: 'cc-by',
      title: 'Creative Commons Attribution',
      url: 'https://creativecommons.org/licenses/by/4.0/'
    },
    metrics: {
      discussions: 0,
      followers: sequence((x) => x * 10),
      issues: 0,
      reuses: 0,
      views: sequence((x) => x * 100)
    },
    private: false,
    quality: {
      score: 0.8,
      dataset_description_quality: true,
      has_open_format: true,
      has_resources: true,
      license: true,
      resources_documentation: false,
      spatial: false,
      tags: true,
      temporal_coverage: false,
      update_frequency: false,
      update_fulfilled_in_time: false
    },
    resources: [],
    spatial: null,
    temporal_coverage: null
  }
})

export default {
  datasetFactory
}
