import type { DatasetV2 } from '@datagouv/components-next'
import { datasetFactory } from 'cypress/support/factories/datasets_factory'
import { resourceFactory } from 'cypress/support/factories/resources_factory'

describe('Dataset Page - QGIS Button', () => {
  let testDataset: DatasetV2

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
  })

  it('should show QGIS button for dataset with WFS resource', () => {
    testDataset = datasetFactory.one()
    const wfsResource = resourceFactory.one({ traits: ['wfs'] })

    cy.mockDatasetAndRelatedObjects(testDataset, [wfsResource])
    cy.visit(`/datasets/${testDataset.id}`)

    cy.get('.test__open_dataset_in_qgis_btn').should('be.visible')
  })

  it('should show QGIS button for dataset with WMS resource', () => {
    testDataset = datasetFactory.one()
    const wmsResource = resourceFactory.one({ traits: ['wms'] })

    cy.mockDatasetAndRelatedObjects(testDataset, [wmsResource])
    cy.visit(`/datasets/${testDataset.id}`)

    cy.get('.test__open_dataset_in_qgis_btn').should('be.visible')
  })

  it('should NOT show QGIS button for dataset without OGC resource', () => {
    testDataset = datasetFactory.one()
    const csvResource = resourceFactory.one({ traits: ['csv'] })

    cy.mockDatasetAndRelatedObjects(testDataset, [csvResource])
    cy.visit(`/datasets/${testDataset.id}`)

    cy.get('.test__open_dataset_in_qgis_btn').should('not.exist')
  })

  it('should trigger download when clicking QGIS button', () => {
    testDataset = datasetFactory.one()
    const wfsResource = resourceFactory.one({ traits: ['wfs'] })

    cy.mockDatasetAndRelatedObjects(testDataset, [wfsResource])
    cy.visit(`/datasets/${testDataset.id}`)

    cy.window().then((win) => {
      cy.spy(win.URL, 'createObjectURL').as('createObjectURL')
    })

    cy.get('.test__open_dataset_in_qgis_btn').click()

    cy.get('@createObjectURL').should('have.been.calledOnce')
  })
})
