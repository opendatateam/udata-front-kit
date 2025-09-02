import { build, sequence } from 'mimicry-js'

const organizationFactory = build({
  fields: {
    acronym: sequence((x) => `ORGA${x}`),
    badges: [],
    class: 'Organization',
    id: sequence((x) => `org_id_${x}`),
    logo: '/public/blank_state/file.svg',
    logo_thumbnail: '/public/blank_state/file.svg',
    name: sequence((x) => `Organization ${x}`),
    page: sequence(
      (x) => `https://demo.data.gouv.fr/organizations/organization-${x}/`
    ),
    slug: sequence((x) => `organization-${x}`),
    uri: sequence(
      (x) => `https://demo.data.gouv.fr/api/1/organizations/organization-${x}/`
    )
  }
})

const dinumOrganization = organizationFactory.one({
  overrides: {
    acronym: 'DINUM',
    badges: [{ kind: 'certified' }, { kind: 'public-service' }],
    class: 'Organization',
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

export default {
  organizationFactory,
  dinumOrganization
}
