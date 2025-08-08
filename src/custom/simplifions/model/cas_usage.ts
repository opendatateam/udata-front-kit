import type { TopicExtras } from '@/model/topic'

export interface RecoSolution {
  En_quoi_cette_solution_est_elle_utile_pour_ce_cas_d_usage_: string
  Concretement_pour_les_usagers_: string
  Concretement_pour_vos_agents_: string
  Ce_que_ne_fait_pas_cette_solution_: string
  Moyens_requis_pour_la_mise_en_oeuvre: string[]
  Nom_de_la_solution_publique: string
  solution_topic_id: string
  image_principale: number[]
  solutions_editeurs_topics: SolutionEditeurTopic[]
  API_et_data_utiles_fournies_par_la_solution_datagouv_slugs: string[]
}

export interface SolutionEditeurTopic {
  topic_id: string
  solution_name: string
  editeur_name: string
}

export interface SimplifionsCasUsage {
  Icone_du_titre: string
  Titre: string
  Contexte: string
  Cadre_juridique: string
  API_et_donnees_utiles: SimplifionsDataOrApi[]
  reco_solutions: RecoSolution[]
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
