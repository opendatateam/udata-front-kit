import type { GristRecord } from '../grist'

export type CasUsage = {
  A_destination_de: number[]
  Budget_requis: number[]
  Cadre_juridique: string
  Contexte: string
  Description_courte: string
  Icone_du_titre: string
  Modifie_le: number
  Modifie_par: string
  Nom: string
  Nom_complet: string
  Pour_simplifier_les_demarches_de: number[]
  Recommandations: number[]
  Types_de_simplification: number[]
  Visible_sur_simplifions: boolean
}
export type CasUsageRecord = GristRecord & {
  fields: CasUsage
}

export type Recommandation = {
  API_et_datasets_utiles_fournis: number[]
  API_ou_datasets_recommandes: number
  Cas_d_usage: number
  Ce_que_ne_fait_pas_cette_solution: string
  Ces_logiciels_l_integrent_deja: number[]
  Concretement_pour_les_usagers: string
  Concretement_pour_vos_agents: string
  En_quoi_cette_solution_est_elle_utile_pour_ce_cas_d_usage: string
  Modifie_le: number
  Modifie_par: string
  Nom_de_la_recommandation: string
  Solution_recommandee: number
  Visible_sur_simplifions: boolean
  Image: number[] | null
  Descriptions_des_API_et_datasets_utiles_fournis: number[]
  budget_slugs: string[]
}
export type RecommandationRecord = GristRecord & {
  fields: Recommandation
}

export type ApiOrDataset = {
  UID_datagouv: string
  Nom: string
  Type: string
  Fourni_par: number
  Integre_par: number[]
  Visible_sur_simplifions: boolean
  Modifie_par: string
  Modifie_le: number
  Description_pour_la_recommandation: string
}
export type ApiOrDatasetRecord = GristRecord & {
  fields: ApiOrDataset
}

export type ApiOrDatasetUtiles = {
  Cas_d_usage: number
  Api_ou_dataset_utile_fourni_par_une_recommandation: number
  En_quoi_cette_API_ou_dataset_est_utile_pour_ce_cas_d_usage: string
  Ordre: number
  Modifie_par: string
  Modifie_le: number
}
export type ApiOrDatasetUtilesRecord = GristRecord & {
  fields: ApiOrDatasetUtiles
}

export type Solution = {
  API_ou_datasets_integres: number[] | null
  APIs_ou_datasets_fournis: number[] | null
  A_destination_de: number[]
  Budget_requis: number[]
  Cette_solution_ne_permet_pas: string
  Cette_solution_permet: string
  Description_courte: string
  Image: number[] | null
  Legende_de_l_image: string | null
  Modifie_le: number
  Modifie_par: string
  Nom: string
  Nom_de_l_operateur: string[]
  Operateur: number[]
  Pour_simplifier_les_demarches_de: number[]
  Prix: string
  Public_ou_prive: string
  Site_internet: string
  Types_de_simplification: number[]
  Visible_sur_simplifions: boolean
  Recommande_pour_les_cas_d_usages: number[] | null
  Type_de_solution: string[]
}
export type SolutionRecord = GristRecord & {
  fields: Solution
}
