import type { Topic } from '@/model/topic'

type ADestinationDe = {
  id: number
  label: string
}

export interface TopicCasUsagesExtras {
  'simplifions-v2-cas-d-usages': {
    id: number
    A_destination_de: ADestinationDe[]
  }
}

export interface TopicSolutionsExtras {
  'simplifions-v2-solutions': {
    id: number
    Image: number[] | null
    Nom_de_l_operateur: string[]
    Public_ou_prive: string
    A_destination_de: ADestinationDe[]
  }
}

export type TopicCasUsage = Omit<Topic, 'extras'> & {
  extras: TopicCasUsagesExtras
}
export type TopicSolution = Omit<Topic, 'extras'> & {
  extras: TopicSolutionsExtras
}
