import { datasetFactory } from 'cypress/support/factories/datasets_factory'
import { resourceFactory } from 'cypress/support/factories/resources_factory'

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
    cy.contains('button', 'Informations').find('sup').should('not.exist')
  })
})
