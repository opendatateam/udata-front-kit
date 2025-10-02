import type { Factor, Topic } from '@/model/topic'
import {
  expandDisclosureGroup,
  factorFactory,
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
      visitTopic(testTopic.id)
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
      visitTopic(emptyTopic.id)

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
      visitTopic(testTopic.id)

      cy.wait('@getElementsNone')

      // Ungrouped factors should be visible immediately without needing to expand
      cy.contains(testFactors[0].title).should('be.visible')
      cy.contains(testFactors[1].title).should('be.visible')
    })
  })
})
