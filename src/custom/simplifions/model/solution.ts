import type { TopicExtras } from '@/model/topic'

export interface SimplifionsSolution {
  Image_principale: string | null
  Legende_image_principale: string
  Prix_: string
  Description_courte: string
  Description_longue: string
  Cette_solution_permet_: string
  Cette_solution_ne_permet_pas_: string
  Ref_Nom_de_la_solution: string
  URL_Consulter_la_solution_: string
  operateur_nom: string
  operateur_nom_long: string
  types_de_solution: string[]
  cas_d_usages_topics_ids: string[]
  is_public: boolean
}

export interface SimplifionsSolutionsExtras extends TopicExtras {
  'simplifions-solutions': SimplifionsSolution
}
