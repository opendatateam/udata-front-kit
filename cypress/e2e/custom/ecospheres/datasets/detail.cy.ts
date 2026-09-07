import type { DatasetV2 } from '@datagouv/components-next'
import { dataserviceFactory } from 'cypress/support/factories/dataservices_factory'
import { datasetFactory } from 'cypress/support/factories/datasets_factory'
import { resourceFactory } from 'cypress/support/factories/resources_factory'
import { reuseFactory } from 'cypress/support/factories/reuses_factory'

describe('Dataset Page - Tab counts', () => {
  let testDataset: DatasetV2

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()

    // distinct, non-zero values so a field mix-up (e.g. summing the wrong
    // metric, or reading a list length instead of resources.total) fails loudly
    testDataset = datasetFactory.one({
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

    cy.mockDatasetAndRelatedObjects(
      testDataset,
      resourceFactory.many(4),
      // list content is intentionally smaller than metrics.dataservices/reuses
      // above, so the tab count can't accidentally match a list length instead
      dataserviceFactory.many(1),
      reuseFactory.many(1)
    )

    cy.visit(`/datasets/${testDataset.id}`)
    cy.wait(`@get_datasets_${testDataset.id}`)
  })

  it('should show the resources count on the Fichiers tab', () => {
    cy.contains('button', 'Fichiers (4)').should('be.visible')
  })

  it('should show the combined reuses + dataservices count on the Réutilisations et API tab', () => {
    cy.contains('button', 'Réutilisations et API (5)').should('be.visible')
  })

  it('should show the discussions count on the Discussions tab', () => {
    cy.contains('button', 'Discussions (7)').should('be.visible')
  })

  it('should not show a count on the Informations tab', () => {
    cy.contains('button', 'Informations').find('sup').should('not.exist')
  })
})
