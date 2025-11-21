import type { Factor, Topic } from '@/model/topic'
import {
  createTestTopic,
  expandDisclosureGroup,
  factorFactory,
  mockTopicAndDiscussions,
  mockTopicElementsByClass,
  setupElementTest,
  setupEmptyTopic,
  setupTopicWithExistingFactors,
  visitTopic
} from './support'

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

      const mainTopic = createTestTopic({
        slug: 'main-topic',
        elements: {
          total: 1
        }
      })

      // Mock the main topic and the referenced topic
      mockTopicAndDiscussions(mainTopic, [topicRefFactor], [referencedTopic])

      // Mock element calls - topic reference factors have element: null
      mockTopicElementsByClass(mainTopic.id, [], [topicRefFactor], [])

      visitTopic(mainTopic.slug)

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
  })
})
