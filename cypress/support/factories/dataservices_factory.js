import { build, sequence } from 'mimicry-js'
import { dinumOrganization } from './organizations_factory'

const dataserviceFactory = build({
  fields: {
    organization: dinumOrganization,
    title: 'Sample Dataservice',
    description: 'Sample dataservice description',
    created_at: '2025-07-28T12:03:28.390000+00:00',
    last_modified: '2025-07-28T14:03:44.363000+00:00',
    id: sequence((x) => `dataservice_id_${x}`),
    slug: sequence((x) => `dataservice_slug_${x}`),
    tags: ['api', 'sample'],
    uri: sequence((x) => `/api/1/dataservices/dataservice_slug_${x}/`),
    page: sequence(
      (x) => `https://demo.data.gouv.fr/dataservices/dataservice_slug_${x}/`
    ),
    access_type: 'public', // 'public' or 'restricted'
    availability: sequence((x) => Math.min(95 + (x % 5), 100)), // availability percentage
    badges: [],
    contact_point: null,
    deleted: null,
    extras: {},
    featured: false,
    format: 'json',
    harvest: null,
    last_update: '2025-07-28T14:03:44.363000+00:00',
    license: {
      id: 'cc-by',
      title: 'Creative Commons Attribution',
      url: 'https://creativecommons.org/licenses/by/4.0/'
    },
    metrics: {
      discussions: 0,
      followers: sequence((x) => x * 5),
      issues: 0,
      views: sequence((x) => x * 50)
    },
    private: false,
    quality: {
      score: 0.75,
      all_resources_available: true,
      dataset_description_quality: true,
      has_open_format: true,
      license: true,
      resources_documentation: false,
      update_frequency: false
    },
    spatial: null,
    temporal_coverage: null,
    endpoint: sequence((x) => `https://api.example.com/v1/service_${x}`),
    base_api_url: sequence((x) => `https://api.example.com/v1/service_${x}`)
  }
})

export default {
  dataserviceFactory
}
