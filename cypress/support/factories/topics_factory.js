import { build, sequence } from 'mimicry-js'
import { organizationFactory } from './organizations_factory'

const topicFactory = build({
  fields: {
    organization: organizationFactory.one(),
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

const casUsageFactory = build({
  fields: {
    ...topicFactory.one(),
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
  topicFactory,
  casUsageFactory
}
