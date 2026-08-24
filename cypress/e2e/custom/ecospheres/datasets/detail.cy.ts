import type { DatasetV2 } from '@datagouv/components-next'
import { datagouvResponseBuilder } from '../../../../support/datagouv_mocks'
import { datasetFactory } from '../../../../support/factories/datasets_factory'

// matches configs/ecospheres/config.yaml networks.simm universe_query.topic
const SIMM_TOPIC_ID = '6a82baef02381db0dc7229cf'

function mockDatasetNetworks(datasetId: string, topics: object[] = []) {
  cy.intercept(
    'GET',
    `**/api/2/topics/?dataset=${datasetId}&tag=ecospheres-networks`,
    {
      statusCode: 200,
      body: datagouvResponseBuilder(topics)
    }
  ).as('getDatasetNetworks')
}

describe('Dataset Detail View - Networks (univers)', () => {
  let dataset: DatasetV2

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    dataset = datasetFactory.one()
    cy.mockDatasetAndRelatedObjects(dataset)
  })

  it('displays the network block when the dataset belongs to a SIF network', () => {
    mockDatasetNetworks(dataset.id, [
      {
        id: SIMM_TOPIC_ID,
        name: 'Univers SIMM',
        slug: 'univers-simm',
        tags: ['ecospheres', 'ecospheres-networks', 'simm']
      }
    ])

    cy.visit(`/datasets/${dataset.id}`)
    cy.wait(`@get_datasets_${dataset.id}`)
    cy.wait('@getDatasetNetworks')

    cy.contains('dt', 'Réseaux').should('be.visible')
    cy.contains('Milieu Marin France')
      .should('have.attr', 'href')
      .and('include', '/contributors/simm/datasets')
  })

  it('does not display the network block when the dataset belongs to no network', () => {
    mockDatasetNetworks(dataset.id, [])

    cy.visit(`/datasets/${dataset.id}`)
    cy.wait(`@get_datasets_${dataset.id}`)
    cy.wait('@getDatasetNetworks')

    cy.contains('dt', 'Réseaux').should('not.exist')
  })
})
