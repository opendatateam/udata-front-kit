import type { Topic } from '@/model/topic'
import { resourceFactory } from 'cypress/support/factories/resources_factory'
import {
  createTestTopicWithElements,
  factorFactory,
  mockTopicAndRelatedObjects,
  mockTopicElementsByClass,
  setupElementTest,
  visitTopic
} from '../support'

describe('Topic Elements - QGIS Integration', () => {
  let testTopic: Topic

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
  })
})
