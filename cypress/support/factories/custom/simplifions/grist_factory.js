import { build, sequence } from 'mimicry-js'

export const gristCasUsageFactory = build({
  fields: {
    id: sequence((x) => x),
    fields: {
      A_destination_de: [1, 2, 3],
      Budget_requis: [1, 2],
      Cadre_juridique: 'Réglementation européenne',
      Contexte:
        'Dans le cadre de la simplification des démarches administratives...',
      Description_courte: "Description courte du cas d'usage",
      Icone_du_titre: '🧑‍💼',
      Modifie_le: sequence(() => Date.now()),
      Modifie_par: 'admin@example.com',
      Nom: sequence((x) => `Cas d'usage ${x}`),
      Nom_complet: sequence((x) => `🧑‍💼 Cas d'usage ${x}`),
      Pour_simplifier_les_demarches_de: [1, 2],
      Recommandations: [1, 2, 3],
      Types_de_simplification: [1, 2],
      Visible_sur_simplifions: true
    }
  }
})

export const gristRecommandationFactory = build({
  fields: {
    id: sequence((x) => x),
    fields: {
      API_et_datasets_utiles_fournis: [1, 2, 3],
      Solution_recommandee: sequence((x) => x),
      API_ou_datasets_recommandes: 0,
      Cas_d_usage: sequence((x) => x),
      Ce_que_ne_fait_pas_cette_solution: 'Cette solution ne permet pas...',
      Ces_logiciels_l_integrent_deja: [1, 2],
      Concretement_pour_les_usagers: 'Pour les usagers, cela signifie...',
      Concretement_pour_vos_agents: 'Pour vos agents, cela permet...',
      En_quoi_cette_solution_est_elle_utile_pour_ce_cas_d_usage:
        'Cette solution est utile car...',
      Modifie_le: sequence(() => Date.now()),
      Modifie_par: 'admin@example.com',
      Nom_de_la_recommandation: sequence((x) => `Recommandation ${x}`),
      Visible_sur_simplifions: true,
      Image: sequence((x) => [x]),
      Descriptions_des_API_et_datasets_utiles_fournis: [1, 2],
      budget_slugs: ['gratuit', 'payant']
    }
  }
})

export const solutionFactory = build({
  fields: {
    id: sequence((x) => x),
    fields: {
      API_ou_datasets_integres: [1, 2],
      APIs_ou_datasets_fournis: [1, 2],
      A_destination_de: [1, 2, 3],
      Budget_requis: [1, 2],
      Cette_solution_ne_permet_pas: 'Cette solution ne permet pas de...',
      Cette_solution_permet: 'Cette solution permet de...',
      Description_courte: 'Description courte de la solution',
      Description_longue: 'Description longue et détaillée de la solution...',
      Image: sequence((x) => [x]),
      Legende_de_l_image: "Légende de l'image",
      Modifie_le: sequence(() => Date.now()),
      Modifie_par: 'admin@example.com',
      Nom: sequence((x) => `Solution ${x}`),
      Nom_de_l_operateur: sequence((x) => [
        `Opérateur ${x}A`,
        `Opérateur ${x}B`
      ]),
      Operateur: [1, 2],
      Pour_simplifier_les_demarches_de: [1, 2],
      Public_ou_prive: sequence((x) => ['Public', 'Privé'][x % 2]),
      Site_internet: sequence((x) => `https://solution${x}.example.com`),
      Types_de_simplification: [1, 2],
      Visible_sur_simplifions: true,
      Recommande_pour_les_cas_d_usages: [1, 2],
      solutions_integratrices: null,
      Type_de_solution: ['Éditeur']
    }
  }
})

export const apiEtDatasetsIntegresFactory = build({
  fields: {
    id: sequence((x) => x),
    fields: {
      Solution_integratrice: sequence((x) => x),
      API_ou_dataset_integre: sequence((x) => x),
      Integre_pour_les_cas_d_usages: [],
      Status_de_l_integration: 'Intégré',
      Solution_fournisseur: 1
    }
  }
})

export const apiOrDatasetFactory = build({
  fields: {
    id: sequence((x) => x),
    fields: {
      UID_datagouv: sequence(
        (x) => ['dataservice-uid-' + x, 'dataset-uid-' + x][x % 2]
      ),
      Nom: sequence((x) => ['API n°' + x, 'Jeu de données n°' + x][x % 2]),
      Type: sequence((x) => ['API', 'Jeu de données'][x % 2]),
      Fourni_par: 1,
      Integre_par: [1, 2],
      Visible_sur_simplifions: true,
      Modifie_par: 'admin@example.com',
      Modifie_le: sequence(() => Date.now()),
      Description_pour_la_recommandation: 'Cette API/dataset est utile pour...'
    }
  }
})

export const apiOrDatasetUtilesFactory = build({
  fields: {
    id: sequence((x) => x),
    fields: {
      Cas_d_usage: sequence((x) => x),
      Api_ou_dataset_utile_fourni_par_une_recommandation: sequence((x) => x),
      En_quoi_cette_API_ou_dataset_est_utile_pour_ce_cas_d_usage:
        'Cette API/dataset est utile car...',
      Modifie_par: 'admin@example.com',
      Modifie_le: sequence(() => Date.now())
    }
  }
})
