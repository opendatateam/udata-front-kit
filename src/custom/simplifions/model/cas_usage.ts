import type { TopicExtras } from '@/model/topic'

export interface RecoSolution {
  Cas_d_usage: number
  Solution_publique: number
  En_quoi_cette_solution_est_elle_utile_pour_ce_cas_d_usage_: string
  Concretement_pour_les_usagers_: string
  Concretement_pour_vos_agents_: string
  Ce_que_ne_fait_pas_cette_solution_: string
  En_production: boolean
  URL_d_acces_specifique: string
  Type_de_simplification: string[]
  Chapitre_H3: string
  Liste_des_editeurs_de_la_solution: number[]
  API_et_data_utiles2: number[]
  Liste_des_editeurs: null
  Nom_de_la_recommandation: string
  Liste_des_produits_publics_proposant_la_solution: number[]
  Liste_des_produits_publics: null
  Moyens_requis_pour_la_mise_en_oeuvre: string[]
  Nom_de_la_solution_publique: string
  solution_slug: string
  url_solution: string
  image_principale: number[]
  solution_topic_id: string
}

export interface SimplifionsCasUsage {
  Titre: string
  usagers: number[]
  Description_courte: string
  A_destination_de_: number[]
  Contexte: string
  Cadre_juridique: string
  Description_longue: string
  apidata_DANS_sousproduitsdinum: number[]
  En_production: boolean
  slug: string
  Type_de_cas_d_usage: string[]
  Cas_d_usages_connexes: null
  API_et_donnees_utiles: SimplifionsDataOrApi[]
  usagers_str: string
  Solutions_publiques_recommandees: number[]
  reco_solutions: RecoSolution[]
  fournisseurs_de_service: string[]
  Structures_detaillees: string[]
  target_users: string[]
  budget: string[]
  types_de_simplification: string[]
  descriptions_api_et_donnees_utiles: DescriptionApiEtDonneesUtiles[]
}

export interface SimplifionsDataOrApi {
  Nom_donnees_ou_API: string
  Type: string
  UID_data_gouv: string
}

export interface DescriptionApiEtDonneesUtiles {
  uid_datagouv: string
  Description_de_l_utilisation: string
}

export interface SimplifionsCasUsagesExtras extends TopicExtras {
  'simplifions-cas-d-usages': SimplifionsCasUsage
}
