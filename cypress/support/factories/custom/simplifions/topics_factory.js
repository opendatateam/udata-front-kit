import { build, sequence } from 'mimicry-js'
import { topicFactory } from '../../topics_factory'

const topicCasUsageFactory = build({
  fields: {
    ...topicFactory.one(),
    tags: ['simplifions-v2', 'simplifions-v2-cas-d-usages'],
    extras: {
      'simplifions-v2-cas-d-usages': {
        id: sequence((x) => x)
      }
    }
  }
})

const topicSolutionFactory = build({
  fields: {
    ...topicFactory.one(),
    tags: ['simplifions-v2', 'simplifions-v2-solutions'],
    extras: {
      'simplifions-v2-solutions': {
        id: sequence((x) => x),
        Image: sequence((x) => [x]),
        Nom_de_l_operateur: sequence((x) => `Operator ${x}`),
        Public_ou_prive: sequence((x) => ['Public', 'Private'][x % 2])
      }
    }
  }
})

export default {
  topicCasUsageFactory,
  topicSolutionFactory
}
