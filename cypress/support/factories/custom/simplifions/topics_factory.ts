import type {
  TopicCasUsage,
  TopicSolution
} from '@/custom/simplifions/model/topics'
import { build, sequence } from 'mimicry-js'
import { dinumOrganization } from '../../organizations_factory'
import { makeTopicSequenceFields, topicBaseFields } from '../../topics_factory'

export const topicCasUsageFactory = build<TopicCasUsage>({
  fields: {
    /* eslint-disable @typescript-eslint/no-explicit-any -- mimicry-js FieldType doesn't support the Owned discriminated union */
    organization: dinumOrganization as any,
    owner: null as any,
    /* eslint-enable @typescript-eslint/no-explicit-any */
    ...topicBaseFields,
    ...makeTopicSequenceFields(),
    tags: ['simplifions-v2', 'simplifions-v2-cas-d-usages'],
    extras: {
      'simplifions-v2-cas-d-usages': {
        id: sequence((x: number) => x),
        A_destination_de: []
      }
    }
  }
})

export const topicSolutionFactory = build<TopicSolution>({
  fields: {
    /* eslint-disable @typescript-eslint/no-explicit-any -- mimicry-js FieldType doesn't support the Owned discriminated union */
    organization: dinumOrganization as any,
    owner: null as any,
    /* eslint-enable @typescript-eslint/no-explicit-any */
    ...topicBaseFields,
    ...makeTopicSequenceFields(),
    tags: ['simplifions-v2', 'simplifions-v2-solutions'],
    extras: {
      'simplifions-v2-solutions': {
        id: sequence((x: number) => x),
        Image: null,
        Nom_de_l_operateur: [],
        Public_ou_prive: '',
        A_destination_de: []
      }
    }
  }
})
