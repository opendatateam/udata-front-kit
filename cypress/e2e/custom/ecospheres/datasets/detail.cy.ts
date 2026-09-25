import type { DatasetV2 } from '@datagouv/components-next'
import { datasetFactory } from 'cypress/support/factories/datasets_factory'
import { resourceFactory } from 'cypress/support/factories/resources_factory'

const SIMM_TOPIC_ID: string =
  Cypress.env('siteConfig').networks.simm.pages.datasets.universe_query.topic

describe('Dataset Detail View - Networks (univers)', () => {
  let dataset: DatasetV2

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    dataset = datasetFactory.one()
    cy.mockDatasetAndRelatedObjects(dataset)
  })

  it('displays the network block when the dataset belongs to a SIF network', () => {
    cy.mockDatasetNetworks(dataset.id, [
      {
        id: SIMM_TOPIC_ID,
        name: 'Univers SIMM',
        slug: 'univers-simm',
        tags: ['ecospheres', 'ecospheres-networks', 'simm']
      }
    ])

    cy.visit(`/datasets/${dataset.id}`)
    cy.wait(`@get_datasets_${dataset.id}`)
    cy.wait(`@get_dataset_networks_${dataset.id}`)

    cy.contains('dt', 'Réseau').should('be.visible')
    cy.contains('Milieu Marin France')
      .should('have.attr', 'href')
      .and('include', '/contributors/simm/datasets')
  })

  it('does not display the network block when the dataset belongs to no network', () => {
    cy.visit(`/datasets/${dataset.id}`)
    cy.wait(`@get_datasets_${dataset.id}`)
    cy.wait(`@get_dataset_networks_${dataset.id}`)

    cy.contains('dt', 'Réseau').should('not.exist')
  })
})

describe('Dataset Page - Tab counts', () => {
  it('should show distinct counts on each tab', () => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()

    const testDataset = datasetFactory.one({
      overrides: {
        metrics: {
          discussions: 7,
          discussions_open: 0,
          reuses: 3,
          dataservices: 2,
          followers: 0,
          views: 0,
          resources_downloads: 0
        }
      }
    })

    cy.mockDatasetAndRelatedObjects(testDataset, resourceFactory.many(4))

    cy.visit(`/datasets/${testDataset.id}`)
    cy.wait(`@get_datasets_${testDataset.id}`)

    cy.contains('button', 'Fichiers (4)').should('be.visible')
    cy.contains('button', 'Réutilisations et API (5)').should('be.visible')
    cy.contains('button', 'Discussions (7)').should('be.visible')
    cy.contains('button', 'Informations')
      .find('sup.tab-count')
      .should('not.exist')
  })
})
