import type { TopicExtras } from '@/model/topic'

export interface TopicCasUsagesExtras extends TopicExtras {
  'simplifions-v2-cas-d-usages': {
    id: number
  }
}

export interface TopicSolutionsExtras extends TopicExtras {
  'simplifions-v2-solutions': {
    id: number
    Image: number[] | null
    Nom_de_l_operateur: string[]
    Public_ou_prive: string
  }
}
