import type {
  ApiEtDatasetsIntegres,
  CasUsage,
  Recommandation,
  Solution
} from '@/custom/simplifions/model/grist'
import { dataserviceFactory } from '../../dataservices_factory'
import { datasetFactory } from '../../datasets_factory'
import {
  apiEtDatasetsIntegresFactory,
  apiOrDatasetFactory,
  apiOrDatasetUtilesFactory,
  gristCasUsageFactory,
  gristRecommandationFactory,
  solutionFactory
} from './grist_factory'
import { topicCasUsageFactory, topicSolutionFactory } from './topics_factory'

export const mockCasUsage = (
  gristCasUsageFields = {},
  topicFields = {},
  recommandations: { id: number }[] = []
) => {
  const gristCasUsage = gristCasUsageFactory.one({
    overrides: {
      fields: {
        ...gristCasUsageFields
      }
    }
  })

  const topicCasUsage = topicCasUsageFactory.one({
    overrides: {
      ...topicFields,
      extras: {
        'simplifions-v2-cas-d-usages': {
          id: gristCasUsage.id
        }
      }
    }
  })

  cy.mockGristRecords('Recommandations', recommandations)
  cy.mockGristRecords('Cas_d_usages', [gristCasUsage])
  cy.mockDatagouvObject('topics', topicCasUsage.slug, topicCasUsage)
  cy.mockDatagouvObjectListWithTags(
    'topics',
    [`simplifions-v2-cas-d-usages-${gristCasUsage.id}`],
    [topicCasUsage]
  )

  return { gristCasUsage, topicCasUsage }
}

export const mockSolutionRecommandation = (recommandationFields = {}) => {
  const gristRecommandation = gristRecommandationFactory.one({
    overrides: {
      fields: {
        API_ou_datasets_recommandes: 0,
        ...recommandationFields
      }
    }
  })
  const solutionRecommandeeId = gristRecommandation.fields.Solution_recommandee
  const tagWithId = `simplifions-v2-solutions-${solutionRecommandeeId}`

  const topicSolutionRecommandee = topicSolutionFactory.one({
    overrides: {
      tags: ['simplifions-v2', 'simplifions-v2-solutions', tagWithId],
      extras: {
        'simplifions-v2-solutions': { id: solutionRecommandeeId }
      }
    }
  })

  // Inline minimal record — avoids using solutionFactory (which would advance
  // the Nom sequence and shift expected values in other tests).
  // null array fields prevent the solution detail page from making cascading requests.
  const gristSolutionRecommandee = {
    id: solutionRecommandeeId,
    fields: {
      Nom: `Solution ${solutionRecommandeeId}`,
      Visible_sur_simplifions: true,
      API_ou_datasets_integres: null,
      APIs_ou_datasets_fournis: null,
      solutions_integratrices: null
    }
  }

  cy.mockGristRecord('Solutions', gristSolutionRecommandee)
  cy.mockDatagouvObject(
    'topics',
    topicSolutionRecommandee.slug,
    topicSolutionRecommandee
  )
  cy.mockDatagouvObjectListWithTags(
    'topics',
    [tagWithId],
    [topicSolutionRecommandee]
  )

  return { gristRecommandation, topicSolution: topicSolutionRecommandee }
}

export const mockApidatasetRecommandations = (
  amount = 2,
  recommandationFields = {},
  apiOrDatasetFields = {},
  dataserviceFields = {},
  datasetFields = {}
) => {
  const { gristApisAndDatasets, dataservicesOrDatasets } = mockApisOrDatasets(
    amount,
    apiOrDatasetFields,
    dataserviceFields,
    datasetFields
  )

  const gristRecommandations = gristApisAndDatasets.map((girstApiOrDataset) => {
    return gristRecommandationFactory.one({
      overrides: {
        fields: {
          Solution_recommandee: 0,
          API_ou_datasets_recommandes: girstApiOrDataset.id,
          ...recommandationFields
        }
      }
    })
  })

  return { gristApisAndDatasets, gristRecommandations, dataservicesOrDatasets }
}

export const mockApisOrDatasets = (
  amount = 2,
  apiOrDatasetFields = {},
  dataserviceFields = {},
  datasetFields = {}
) => {
  const gristApisAndDatasets = apiOrDatasetFactory.many(amount, {
    overrides: {
      fields: {
        ...apiOrDatasetFields
      }
    }
  })
  // Mock the list of APIs/Datasets and then mock each API/Dataset individually too
  cy.mockGristRecords('APIs_et_datasets', gristApisAndDatasets)
  gristApisAndDatasets.forEach((apiOrDataset) => {
    cy.mockGristRecord('APIs_et_datasets', apiOrDataset)
  })

  const dataservicesOrDatasets = gristApisAndDatasets.map(
    (gristApiAndDataset) => {
      let dataserviceOrDataset

      if (gristApiAndDataset.fields.Type === 'API') {
        dataserviceOrDataset = dataserviceFactory.one({
          overrides: {
            slug: gristApiAndDataset.fields.UID_datagouv,
            ...dataserviceFields
          }
        })
        cy.mockDatagouvObject(
          'dataservices',
          dataserviceOrDataset.slug,
          dataserviceOrDataset
        )
      } else {
        dataserviceOrDataset = datasetFactory.one({
          overrides: {
            slug: gristApiAndDataset.fields.UID_datagouv,
            ...datasetFields
          }
        })
        cy.mockDatagouvObject(
          'datasets',
          dataserviceOrDataset.slug,
          dataserviceOrDataset
        )
      }

      return dataserviceOrDataset
    }
  )

  cy.mockStaticDatagouv() // for the api or dataset images
  return { gristApisAndDatasets, dataservicesOrDatasets }
}

export const mockApiOrDatasetUtiles = (
  gristApiOrDatasetIds: number[],
  apiOrDatasetUtilesFields = {}
) => {
  const gristApiOrDatasetUtiles = gristApiOrDatasetIds.map((id) => {
    return apiOrDatasetUtilesFactory.one({
      overrides: {
        fields: {
          Api_ou_dataset_utile_fourni_par_une_recommandation: id,
          ...apiOrDatasetUtilesFields
        }
      }
    })
  })

  cy.mockGristRecords('API_et_datasets_utiles', gristApiOrDatasetUtiles)

  return { gristApiOrDatasetUtiles }
}

export const mockSolution = (
  gristSolutionFields = {},
  topicSolutionFields = {}
) => {
  const gristSolution = solutionFactory.one({
    overrides: {
      fields: {
        ...gristSolutionFields
      }
    }
  })
  const tagWithId = `simplifions-v2-solutions-${gristSolution.id}`

  const topicSolution = topicSolutionFactory.one({
    overrides: {
      ...topicSolutionFields,
      tags: ['simplifions-v2', 'simplifions-v2-solutions', tagWithId],
      extras: {
        'simplifions-v2-solutions': {
          id: gristSolution.id
        }
      }
    }
  })

  cy.mockGristRecords('Solutions', [gristSolution])
  cy.mockDatagouvObject('topics', topicSolution.slug, topicSolution)
  cy.mockDatagouvObjectListWithTags('topics', [tagWithId], [topicSolution])

  return { gristSolution, topicSolution }
}

/**
 * Mock solutions intégratrices for a supplier solution.
 */
export const mockSolutionsIntegratices = ({
  fournisseurSolutionId,
  integrateursSolutionFields = [] as Partial<Solution>[],
  casUsageFields = [] as Partial<CasUsage>[],
  integrations = [] as Partial<ApiEtDatasetsIntegres>[],
  recommandations = [] as Partial<Recommandation>[]
}: {
  fournisseurSolutionId: number
  integrateursSolutionFields?: Partial<Solution>[]
  casUsageFields?: Partial<CasUsage>[]
  integrations?: Partial<ApiEtDatasetsIntegres>[]
  recommandations?: Partial<Recommandation>[]
}) => {
  const gristIntegrateurs = integrateursSolutionFields.map((fields) =>
    solutionFactory.one({
      overrides: { fields: { ...fields } }
    })
  )

  // Create topic for each integrator so the card can resolve via getTopicByTag
  const topicIntegrateurs = gristIntegrateurs.map((sol) => {
    const tagWithId = `simplifions-v2-solutions-${sol.id}`
    const topic = topicSolutionFactory.one({
      overrides: {
        tags: ['simplifions-v2', 'simplifions-v2-solutions', tagWithId]
      }
    })
    cy.mockDatagouvObjectListWithTags('topics', [tagWithId], [topic])
    return topic
  })

  const gristCasUsages = casUsageFields.map((fields) =>
    gristCasUsageFactory.one({
      overrides: { fields: { ...fields } }
    })
  )
  if (gristCasUsages.length) {
    cy.mockGristRecords('Cas_d_usages', gristCasUsages)
  }

  const gristRecommandations = recommandations.map((fields) =>
    gristRecommandationFactory.one({
      overrides: { fields: { ...fields } }
    })
  )
  cy.mockGristRecords('Recommandations', gristRecommandations)

  const gristIntegrations = integrations.map((fields) =>
    apiEtDatasetsIntegresFactory.one({
      overrides: {
        fields: {
          Solution_fournisseur: fournisseurSolutionId,
          ...fields
        }
      }
    })
  )
  cy.mockGristRecords('API_et_datasets_integres', gristIntegrations)

  return {
    gristIntegrateurs,
    topicIntegrateurs,
    gristCasUsages,
    gristIntegrations
  }
}
