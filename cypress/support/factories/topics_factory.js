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
        Icone_du_titre: '📥',
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

const solutionFactory = build({
  fields: {
    ...topicFactory.one(),
    tags: ['simplifions', 'simplifions-solutions'],
    extras: {
      'simplifions-solutions': {
        Image_principale:
          'https://demo.data.gouv.fr/api/1/topics/sample-solution/image_principale/',
        Legende_image_principale: 'Sample image legend',
        Prix_: 'Gratuit',
        Description_courte: 'Sample short description of the solution',
        Description_longue:
          'Sample long description with more details about what this solution does and how it can help users.',
        Cette_solution_permet_:
          'This solution allows users to do various things efficiently',
        Cette_solution_ne_permet_pas_:
          'This solution does not handle complex edge cases',
        Ref_Nom_de_la_solution: 'Sample Solution Name',
        URL_Consulter_la_solution_: 'https://example.com/solution',
        operateur_nom: 'Sample Operator',
        operateur_nom_long: 'Sample Operator Full Name',
        types_de_solution: ['API', 'Service'],
        cas_d_usages_topics_ids: [],
        is_public: true,
        API_et_data_disponibles: []
      }
    }
  }
})

export default {
  topicFactory,
  casUsageFactory,
  solutionFactory
}
