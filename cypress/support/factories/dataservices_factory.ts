import type { Dataservice } from '@datagouv/components-next'
import { build, sequence } from 'mimicry-js'
import { dinumOrganization } from './organizations_factory'

export const dataserviceFactory = build<Dataservice>({
  // ensures slug and id are synchronized to urls, sometimes sequence() are out of sync.
  postBuild: (obj) => ({
    ...obj,
    self_web_url: `https://www.data.gouv.fr/dataservices/${obj.slug}/`,
    self_api_url: `https://www.data.gouv.fr/api/1/dataservices/${obj.slug}/`,
    datasets: {
      ...obj.datasets,
      href: `https://www.data.gouv.fr/api/1/datasets/?dataservice=${obj.id}`
    }
  }),
  fields: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mimicry-js FieldType doesn't support the Owned discriminated union
    organization: dinumOrganization as any,
    owner: null,
    acronym: sequence((x) => `ACRO${x}`),
    title: sequence((x) => `Sample Dataservice ${x}`),
    description: 'Sample dataservice description',
    created_at: '2025-07-28T12:03:28.390000+00:00',
    metadata_modified_at: '2025-07-28T14:03:44.363000+00:00',
    id: sequence((x) => `dataservice_id_${x}`),
    slug: sequence((x) => `dataservice_slug_${x}`),
    tags: ['api', 'sample'],
    self_web_url: sequence(
      (x) => `https://www.data.gouv.fr/dataservices/dataservice_slug_${x}/`
    ),
    access_type: 'open',
    access_type_reason_category: null,
    access_type_reason: null,
    availability: sequence((x) => Math.min(95 + (x % 5), 100)), // availability percentage
    contact_points: [],
    deleted_at: null,
    archived_at: null,
    extras: {},
    featured: false,
    format: 'json',
    harvest: null,
    license: 'cc-by',
    metrics: {
      discussions: 0,
      discussions_open: 0,
      followers: sequence((x) => x * 5),
      reuses: 0,
      views: sequence((x) => x * 50)
    },
    private: false,
    base_api_url: sequence((x) => `https://api.example.com/v1/service_${x}`),
    authorization_request_url: null,
    machine_documentation_url: null,
    technical_documentation_url: null,
    business_documentation_url: null,
    access_audiences: [],
    permissions: {
      delete: true,
      edit: true
    },
    rate_limiting: 'No rate limiting',
    self_api_url: sequence(
      (x) =>
        `https://www.data.gouv.fr/api/1/dataservices/dataservice_slug_${x}/`
    ),
    datasets: {
      href: sequence(
        (x) =>
          `https://www.data.gouv.fr/api/1/datasets/?dataservice=dataservice_id_${x}`
      ),
      rel: 'subsection',
      total: 0,
      type: 'GET'
    }
  }
})
