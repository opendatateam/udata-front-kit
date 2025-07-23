import type { TopicExtras } from '@/model/topic'

export interface SimplifionsSolution {
  En_production: boolean
  Image_principale: string | null
  Legende_image_principale: string
  Prix_: string
  Solution_publique: number
  Description_courte: string
  Type_de_solution_: number[]
  Moyens_requis_pour_la_mise_en_oeuvre: string[]
  types_de_simplification: string[]
  Description_longue: string
  Cette_solution_permet_: string
  Cette_solution_ne_permet_pas_: string
  URL_demo: string
  slug: string
  Operateur: number[]
  Ref_Nom_de_la_solution: string
  URL_Demander_un_acces_: string
  Pour_simplifier_les_demarches_de_2: number[]
  Produits_publics_qui_ont_integre_le_produit: number[]
  URL_Consulter_la_solution_: string
  A_destination_de_: number[]
  API_et_data_disponibles: number[]
  Logiciels_prives_qui_ont_integre_le_produit: number[]
  Titre: string | null
  fournisseurs_de_service: string[]
  target_users: string[]
  operateur_nom: string
  operateur_nom_long: string
  types_de_solution: string[]
  budget: string[]
  Cas_d_usages: number[]
  cas_d_usages_slugs: string[]
  cas_d_usages_topics_ids: string[]
}

export interface SimplifionsSolutionsExtras extends TopicExtras {
  'simplifions-solutions': SimplifionsSolution
}
