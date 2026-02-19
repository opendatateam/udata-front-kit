import type { Organization } from '@datagouv/components-next'
import { build, sequence } from 'mimicry-js'

export const organizationFactory = build<Organization>({
  fields: {
    acronym: sequence((x) => `ORGA${x}`),
    badges: [],
    id: sequence((x) => `org_id_${x}`),
    logo: '/public/static/blank_state/file.svg',
    logo_thumbnail: '/public/static/blank_state/file.svg',
    name: sequence((x) => `Organization ${x}`),
    page: sequence(
      (x) => `https://demo.data.gouv.fr/organizations/organization-${x}/`
    ),
    slug: sequence((x) => `organization-${x}`),
    uri: sequence(
      (x) => `https://demo.data.gouv.fr/api/1/organizations/organization-${x}/`
    ),
    business_number_id: sequence((x) => `business-number-${x}`),
    description: sequence((x) => `Description for organization ${x}`),
    url: sequence((x) => `https://example.com/organization/${x}`),
    created_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    extras: {},
    deleted: null,
    members: [],
    metrics: {
      dataservices: 42,
      dataservices_by_months: {},
      datasets: 43,
      datasets_by_months: {},
      followers: 44,
      members: 45,
      reuses: 46,
      reuses_by_months: {},
      views: 47
    }
  }
})

export const dinumOrganization = organizationFactory.one({
  overrides: {
    acronym: 'DINUM',
    badges: [{ kind: 'certified' }, { kind: 'public-service' }],
    id: '57fe2a35c751df21e179df72',
    logo: 'https://demo-static.data.gouv.fr/avatars/a0/16eb04d7754b989b7dcd21d77699bd-original.png',
    logo_thumbnail:
      'https://demo-static.data.gouv.fr/avatars/a0/16eb04d7754b989b7dcd21d77699bd-100.png',
    name: 'Direction interministérielle du numérique',
    page: 'https://demo.data.gouv.fr/organizations/direction-interministerielle-du-numerique/',
    slug: 'direction-interministerielle-du-numerique',
    uri: 'https://demo.data.gouv.fr/api/1/organizations/direction-interministerielle-du-numerique/'
  }
})
