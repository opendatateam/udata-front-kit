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

  describe('Topic-Level QGIS Button', () => {
    it('should show topic-level QGIS button when at least one factor has OGC resources', () => {
      // Create factors with mixed resources: WFS, WMS, and CSV
      const factors = factorFactory.many(3, { traits: ['dataset_in_group'] })
      testTopic = createTestTopicWithElements(factors)

      const wfsResource = resourceFactory.one({ traits: ['wfs'] })
      const wmsResource = resourceFactory.one({ traits: ['wms'] })
      const csvResource = resourceFactory.one({ traits: ['csv'] })

      mockTopicAndRelatedObjects(testTopic, {
        factors,
        datasetResources: {
          [factors[0].element!.id]: [wfsResource],
          [factors[1].element!.id]: [wmsResource],
          [factors[2].element!.id]: [csvResource]
        }
      })
      mockTopicElementsByClass(testTopic.id, factors, [], [])

      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')

      // Verify topic-level button is visible
      cy.get('.test__open_topic_in_qgis_btn').should('be.visible')
      cy.contains('button', 'Ouvrir dans QGIS').should('be.visible')
    })

    it('should NOT show topic-level QGIS button when no factors have OGC resources', () => {
      // Create factors with only CSV resources (no OGC)
      const factors = factorFactory.many(2, { traits: ['dataset_in_group'] })
      testTopic = createTestTopicWithElements(factors)

      const csvResources = resourceFactory.many(2, { traits: ['csv'] })

      mockTopicAndRelatedObjects(testTopic, {
        factors,
        datasetResources: {
          [factors[0].element!.id]: [csvResources[0]],
          [factors[1].element!.id]: [csvResources[1]]
        }
      })
      mockTopicElementsByClass(testTopic.id, factors, [], [])

      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')

      // Verify topic-level button does NOT exist
      cy.get('.test__open_topic_in_qgis_btn').should('not.exist')
      cy.contains('button', 'Ouvrir dans QGIS').should('not.exist')
    })

    it('should trigger download when clicking topic-level QGIS button', () => {
      // Create factors with WFS resources
      const factors = factorFactory.many(2, { traits: ['dataset_in_group'] })
      testTopic = createTestTopicWithElements(factors)

      const wfsResources = resourceFactory.many(2, { traits: ['wfs'] })

      mockTopicAndRelatedObjects(testTopic, {
        factors,
        datasetResources: {
          [factors[0].element!.id]: [wfsResources[0]],
          [factors[1].element!.id]: [wfsResources[1]]
        }
      })
      mockTopicElementsByClass(testTopic.id, factors, [], [])

      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')

      // Spy on URL.createObjectURL to detect blob creation
      cy.window().then((win) => {
        cy.spy(win.URL, 'createObjectURL').as('createObjectURL')
      })

      // Click the topic-level QGIS button
      cy.get('.test__open_topic_in_qgis_btn').click()

      // Verify download was triggered
      cy.get('@createObjectURL').should('have.been.calledOnce')
    })

    it('should keep individual dataset QGIS buttons alongside topic-level button', () => {
      // Create single factor with OGC resource
      testFactor = factorFactory.one({ traits: ['dataset_in_group'] })
      testTopic = createTestTopicWithElements([testFactor])

      const wfsResource = resourceFactory.one({ traits: ['wfs'] })

      mockTopicAndRelatedObjects(testTopic, {
        factors: [testFactor],
        datasetResources: {
          [testFactor.element!.id]: [wfsResource]
        }
      })
      mockTopicElementsByClass(testTopic.id, [testFactor], [], [])

      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')

      // Verify topic-level button exists
      cy.get('.test__open_topic_in_qgis_btn').should('be.visible')

      // Expand group to see individual dataset
      expandDisclosureGroup()

      // Verify individual dataset button also exists (exact match)
      cy.contains('button', 'Ouvrir dans QGIS').should('be.visible')
    })
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
