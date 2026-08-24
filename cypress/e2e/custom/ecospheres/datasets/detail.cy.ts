import type { DatasetV2 } from '@datagouv/components-next'
import { datasetFactory } from '../../../../support/factories/datasets_factory'

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

    cy.contains('dt', 'Réseaux').should('be.visible')
    cy.contains('Milieu Marin France')
      .should('have.attr', 'href')
      .and('include', '/contributors/simm/datasets')
  })

  it('does not display the network block when the dataset belongs to no network', () => {
    cy.visit(`/datasets/${dataset.id}`)
    cy.wait(`@get_datasets_${dataset.id}`)
    cy.wait(`@get_dataset_networks_${dataset.id}`)

    cy.contains('dt', 'Réseaux').should('not.exist')
  })
})
