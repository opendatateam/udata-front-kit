import { build, sequence } from 'mimicry-js'

const organizationBuilder = build({
  fields: {
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

const topicBuilder = build({
  fields: {
    organization: organizationBuilder.one(),
    name: 'Sample Topic',
    description: 'Sample description',
    created_at: '2025-07-28T12:03:28.390000+00:00',
    last_modified: '2025-07-28T14:03:44.363000+00:00',
    id: sequence((x) => `topic_id_${x}`),
    private: false,
    slug: sequence((x) => `topic_slug_${x}`),
    tags: [],
    uri: sequence((x) => `/api/1/topics/topic_slug_${x}/`)
  }
})

const casUsageBuilder = build({
  fields: {
    ...topicBuilder.one(),
    tags: ['simplifions', 'simplifions-cas-d-usages'],
    extras: {
      'simplifions-cas-d-usages': {
        Icone_du_titre:
          'https://demo.data.gouv.fr/api/1/topics/sample-topic/icone_du_titre/',
        Titre: 'Sample title',
        Contexte: 'Sample context',
        Cadre_juridique: 'Sample legal framework',
        API_et_donnees_utiles: [],
        reco_solutions: [],
        descriptions_api_et_donnees_utiles: []
      }
    }
  }
})

export default {
  topicBuilder,
  organizationBuilder,
  casUsageBuilder
}
