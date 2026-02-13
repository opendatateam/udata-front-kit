import { sequence } from 'mimicry-js'
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

export const mockCasUsage = (gristCasUsageFields = {}, topicFields = {}) => {
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
        Solution_recommandee: sequence((x) => x),
        API_ou_datasets_recommandes: 0,
        ...recommandationFields
      }
    }
  })
  const tagWithId = `simplifions-v2-solutions-${gristRecommandation.fields.Solution_recommandee}`

  const topicSolution = topicSolutionFactory.one({
    overrides: {
      tags: ['simplifions-v2', 'simplifions-v2-solutions', tagWithId]
    }
  })

  cy.mockGristRecords('Recommandations', [gristRecommandation])
  cy.mockDatagouvObject('topics', topicSolution.slug, topicSolution)
  cy.mockDatagouvObjectListWithTags('topics', [tagWithId], [topicSolution])

  return { gristRecommandation, topicSolution }
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

  cy.mockGristRecords('Recommandations', gristRecommandations)

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
      var dataserviceOrDataset

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
  gristApiOrDatasetIds,
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
      tags: ['simplifions-v2', 'simplifions-v2-solutions', tagWithId],
      ...topicSolutionFields
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
  integrateursSolutionFields = [],
  casUsageFields = [],
  integrations = [],
  recommandations = []
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
