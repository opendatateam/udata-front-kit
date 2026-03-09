import type { TopicExtras } from '@/model/topic'

type ADestinationDe = {
  id: number
  label: string
}

export interface TopicCasUsagesExtras extends TopicExtras {
  'simplifions-v2-cas-d-usages': {
    id: number
    A_destination_de: ADestinationDe[]
  }
}

export interface TopicSolutionsExtras extends TopicExtras {
  'simplifions-v2-solutions': {
    id: number
    Image: number[] | null
    Nom_de_l_operateur: string[]
    Public_ou_prive: string
    A_destination_de: ADestinationDe[]
  }
}
