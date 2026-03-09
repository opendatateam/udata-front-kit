import {
  Availability,
  type Factor,
  type SiteId,
  type Topic
} from '@/model/topic'
import { dataserviceFactory } from 'cypress/support/factories/dataservices_factory'
import { createIndicator } from '../../indicators/support'
import {
  createTestTopic,
  createTestTopicWithElements,
  expandDisclosureGroup,
  factorFactory,
  mockTopicAndRelatedObjects,
  mockTopicElementsByClass,
  setupElementTest,
  setupEmptyTopic,
  setupTopicWithExistingFactors,
  visitTopic
} from '../support'

describe('Topic Elements - Factor List Display', () => {
  let testTopic: Topic
  let testFactors: Factor[]

  beforeEach(() => {
    ;({ testTopic, testFactors } = setupTopicWithExistingFactors())
  })

  describe('Displaying Factors', () => {
    beforeEach(() => {
      visitTopic(testTopic.slug)
    })

    it('should display existing factors on the topic page', () => {
      cy.wait('@getElementsDataset')

      // Verify both test factors exist, but hidden because in group
      cy.contains(testFactors[0].title).should('exist').and('not.be.visible')
      cy.contains(testFactors[1].title).should('exist').and('not.be.visible')

      // Find and expand the "Test Group" containing our test factors
      expandDisclosureGroup()

      // Verify both test factors are now visible
      cy.contains(testFactors[0].title).and('be.visible')
      cy.contains(testFactors[1].title).and('be.visible')

      // Verify edit and delete buttons are visible for topic owner
      cy.get('.test__edit_factor_btn').should('have.length.at.least', 1)
      cy.get('.test__delete_factor_btn').should('have.length.at.least', 1)

      // Verify add dataset button is visible for topic owner
      cy.get('.test__add_dataset_btn').should('be.visible')
    })

    it('should handle empty factors list', () => {
      const { testTopic: emptyTopic } = setupEmptyTopic()
      visitTopic(emptyTopic.slug)

      // this one will always fired and is easy to catch, signals that the page is loaded
      cy.wait('@getElementsReuse')

      // Should still show add button but no factors
      cy.get('.test__add_dataset_btn').should('be.visible')
      cy.contains(testFactors[0].title).should('not.exist')
      cy.contains(testFactors[1].title).should('not.exist')
    })

    it('should display ungrouped factors as visible by default', () => {
      const ungroupedFactors = factorFactory.many(2, {
        traits: ['missing_no_group']
      })
      const { testTopic, testFactors } =
        setupTopicWithExistingFactors(ungroupedFactors)
      visitTopic(testTopic.slug)

      cy.wait('@getElementsNone')

      // Ungrouped factors should be visible immediately without needing to expand
      cy.contains(testFactors[0].title).should('be.visible')
      cy.contains(testFactors[1].title).should('be.visible')
    })

    it('should display TopicCard for factors referencing local topics', () => {
      setupElementTest()

      // Create a referenced topic that will be displayed in the card
      const referencedTopic = createTestTopic({
        slug: 'referenced-topic-1',
        name: 'Referenced Topic Name'
      })

      // Create a factor with topic_reference trait
      const topicRefFactor = factorFactory.one({
        traits: ['topic_reference']
      })

      // Create and mock a test topic with this factor and referenced topic
      const mainTopic = createTestTopicWithElements([topicRefFactor])
      mockTopicAndRelatedObjects(mainTopic, {
        factors: [topicRefFactor],
        referencedTopics: [referencedTopic]
      })
      mockTopicElementsByClass(mainTopic.id, [], [topicRefFactor], [])

      visitTopic(mainTopic.slug)

      // Wait for element=null mock, for referenced topic
      cy.wait('@getElementsNone')

      // Expand the group to see the factor
      expandDisclosureGroup()

      // Verify factor title is visible
      cy.contains(topicRefFactor.title).should('be.visible')

      // Verify TopicCard is displayed with the referenced topic name
      cy.contains(referencedTopic.name).should('be.visible')

      // Verify the badge with "bouquet" label is displayed
      cy.get('.fr-badge--mention-grey')
        .should('be.visible')
        .and('contain.text', 'bouquet')

      // Verify the "Accéder au catalogue" button is NOT displayed
      cy.contains('Accéder au catalogue').should('not.exist')

      // Mock element calls for referenced topic (for navigation)
      mockTopicElementsByClass(referencedTopic.id, [], [], [])

      // Click on the TopicCard to navigate
      cy.contains(referencedTopic.name).click()

      // Verify navigation occurred to the referenced topic
      cy.url().should('include', `/bouquets/${referencedTopic.slug}`)

      // Verify we're now on the referenced topic page
      cy.contains('h1', referencedTopic.name).should('be.visible')
    })

    it('should display indicator datasets with the Indicateur badge', () => {
      setupElementTest()

      // Create an indicator dataset
      const indicatorDataset = createIndicator({
        id: 'indicator-dataset-1',
        title: 'Indicator Dataset Title'
      })

      // Create a factor pointing to this indicator dataset
      const indicatorFactor = factorFactory.one({
        overrides: {
          title: 'Factor with Indicator',
          extras: {
            ['ecospheres' as SiteId]: {
              uri: `https://www.data.gouv.fr/datasets/${indicatorDataset.id}`,
              availability: Availability.LOCAL_AVAILABLE,
              group: 'Test Group'
            }
          },
          element: {
            class: 'Dataset',
            id: indicatorDataset.id
          }
        }
      })

      // Create topic with the indicator factor
      const mainTopic = createTestTopicWithElements([indicatorFactor])

      mockTopicAndRelatedObjects(mainTopic, {
        factors: [indicatorFactor],
        datasets: { [indicatorDataset.id]: indicatorDataset }
      })
      mockTopicElementsByClass(mainTopic.id, [indicatorFactor], [], [])

      visitTopic(mainTopic.slug)

      cy.wait('@getElementsDataset')

      // Expand the group to see the factor
      expandDisclosureGroup()

      // Verify the indicator dataset title is visible
      cy.contains('Indicator Dataset Title').should('be.visible')

      // Check that the indicator dataset has the "Indicateur" badge
      cy.contains('Indicator Dataset Title')
        .closest('.indicator-card-wrapper')
        .find('.fr-badge')
        .contains('Indicateur')
        .should('be.visible')
    })

    it('should display DataserviceCard for factors referencing dataservices', () => {
      setupElementTest()

      // Create referenced dataservices that will be displayed in the cards
      const referencedDataserviceEcologie = dataserviceFactory.one({
        overrides: {
          slug: 'referenced-dataservice-1',
          title: 'Referenced Dataservice 1 Name'
        }
      })
      const referencedDataserviceDatagouvfr = dataserviceFactory.one({
        overrides: {
          slug: 'referenced-dataservice-2',
          title: 'Referenced Dataservice 2 Name'
        }
      })
      const referencedDataservices = [
        referencedDataserviceEcologie,
        referencedDataserviceDatagouvfr
      ]

      // Create factors with dataservice_reference traits
      const dataserviceFactorEcologie = factorFactory.one({
        traits: ['dataservice_reference_ecologie']
      })
      // Override URI for second factor because each trait's sequence() starts from 1 independently
      // Without override, both would generate referenced-dataservice-1
      const dataserviceFactorDatagouvfr = factorFactory.one({
        traits: ['dataservice_reference_datagouvfr'],
        overrides: {
          extras: {
            ['ecospheres' as SiteId]: {
              uri: `${Cypress.env('siteConfig').datagouvfr.base_url}/dataservices/referenced-dataservice-2`,
              availability: Availability.LOCAL_AVAILABLE,
              group: 'Test Group'
            }
          }
        }
      })
      const dataserviceFactors = [
        dataserviceFactorEcologie,
        dataserviceFactorDatagouvfr
      ]

      // Create and mock a test topic with those factors and referenced dataservices
      const mainTopic = createTestTopicWithElements(dataserviceFactors)
      mockTopicAndRelatedObjects(mainTopic, {
        factors: dataserviceFactors,
        referencedDataservices
      })
      mockTopicElementsByClass(mainTopic.id, [], dataserviceFactors, [])

      visitTopic(mainTopic.slug)

      // Wait for element=null mock, for referenced dataservices
      cy.wait('@getElementsNone')

      // Expand the group to see the factors
      expandDisclosureGroup()

      // Verify factor title is visible
      for (const dataserviceFactor of dataserviceFactors) {
        cy.contains(dataserviceFactor.title).should('be.visible')
      }

      // Verify DataserviceCard is displayed with the referenced dataservice name
      for (const referencedDataservice of referencedDataservices) {
        cy.contains(referencedDataservice.title).should('be.visible')
      }

      // Verify the badge with "API" label is displayed twice
      cy.get('.fr-badge--mention-grey')
        .should('have.length', 2)
        .each(($badge) => {
          cy.wrap($badge).should('contain.text', 'API')
        })

      // Verify the "Accéder au catalogue" button is NOT displayed
      cy.contains('Accéder au catalogue').should('not.exist')

      // Click on the DataserviceCard to navigate
      cy.contains(referencedDataservices[0].title).click()

      // Verify navigation occurred to the referenced dataservice
      cy.url().should(
        'include',
        `/dataservices/${referencedDataservices[0].id}`
      )
    })
  })
})
