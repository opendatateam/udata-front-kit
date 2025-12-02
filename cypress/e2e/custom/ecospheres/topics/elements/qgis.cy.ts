import type { Factor, Topic } from '@/model/topic'
import { resourceFactory } from 'cypress/support/factories/resources_factory'
import {
  createTestTopicWithElements,
  expandDisclosureGroup,
  factorFactory,
  mockTopicAndRelatedObjects,
  mockTopicElementsByClass,
  setupElementTest,
  visitTopic
} from '../support'

describe('Topic Elements - QGIS Integration', () => {
  let testTopic: Topic
  let testFactor: Factor

  beforeEach(() => {
    setupElementTest()
  })

  describe('QGIS Button Display', () => {
    it('should show "Ouvrir dans QGIS" button for dataset with WFS service', () => {
      // Create a factor with a dataset
      testFactor = factorFactory.one({ traits: ['dataset_in_group'] })
      testTopic = createTestTopicWithElements([testFactor])

      const datasetId = testFactor.element!.id

      // Create WFS resource
      const wfsResource = resourceFactory.one({ traits: ['wfs'] })

      // Mock topic and dataset with WFS resource
      mockTopicAndRelatedObjects(testTopic, {
        factors: [testFactor],
        datasetResources: {
          [datasetId]: [wfsResource]
        }
      })
      mockTopicElementsByClass(testTopic.id, [testFactor], [], [])

      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')

      // Expand group to see the dataset
      expandDisclosureGroup()

      // Verify QGIS button is visible
      cy.contains('button', 'Ouvrir dans QGIS').should('be.visible')
    })

    it('should show "Ouvrir dans QGIS" button for dataset with WMS service', () => {
      // Create a factor with a dataset
      testFactor = factorFactory.one({ traits: ['dataset_in_group'] })
      testTopic = createTestTopicWithElements([testFactor])

      const datasetId = testFactor.element!.id

      // Create WMS resource
      const wmsResource = resourceFactory.one({ traits: ['wms'] })

      // Mock topic and dataset with WMS resource
      mockTopicAndRelatedObjects(testTopic, {
        factors: [testFactor],
        datasetResources: {
          [datasetId]: [wmsResource]
        }
      })
      mockTopicElementsByClass(testTopic.id, [testFactor], [], [])

      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')

      // Expand group to see the dataset
      expandDisclosureGroup()

      // Verify QGIS button is visible
      cy.contains('button', 'Ouvrir dans QGIS').should('be.visible')
    })

    it('should NOT show "Ouvrir dans QGIS" button for dataset without OGC service', () => {
      // Create a factor with a dataset
      testFactor = factorFactory.one({ traits: ['dataset_in_group'] })
      testTopic = createTestTopicWithElements([testFactor])

      const datasetId = testFactor.element!.id

      // Create regular CSV resource (no OGC service)
      const csvResource = resourceFactory.one({ traits: ['csv'] })

      // Mock topic and dataset with CSV resource only
      mockTopicAndRelatedObjects(testTopic, {
        factors: [testFactor],
        datasetResources: {
          [datasetId]: [csvResource]
        }
      })
      mockTopicElementsByClass(testTopic.id, [testFactor], [], [])

      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')

      // Expand group to see the dataset
      expandDisclosureGroup()

      // Verify QGIS button does NOT exist
      cy.contains('button', 'Ouvrir dans QGIS').should('not.exist')
    })

    it('should trigger download when clicking "Ouvrir dans QGIS" button', () => {
      // Create a factor with a dataset
      testFactor = factorFactory.one({ traits: ['dataset_in_group'] })
      testTopic = createTestTopicWithElements([testFactor])

      const datasetId = testFactor.element!.id

      // Create WFS resource
      const wfsResource = resourceFactory.one({ traits: ['wfs'] })

      // Mock topic and dataset with WFS resource
      mockTopicAndRelatedObjects(testTopic, {
        factors: [testFactor],
        datasetResources: {
          [datasetId]: [wfsResource]
        }
      })
      mockTopicElementsByClass(testTopic.id, [testFactor], [], [])

      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')

      // Expand group to see the dataset
      expandDisclosureGroup()

      // Spy on URL.createObjectURL to detect blob creation
      cy.window().then((win) => {
        cy.spy(win.URL, 'createObjectURL').as('createObjectURL')
      })

      // Click the QGIS button
      cy.contains('button', 'Ouvrir dans QGIS').click()

      // Verify that URL.createObjectURL was called (indicating download triggered)
      cy.get('@createObjectURL').should('have.been.calledOnce')
    })
  })
})
