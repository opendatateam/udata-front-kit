import type { Topic } from '@/model/topic'
import {
  createTestTopic,
  mockTopicAndRelatedObjects,
  setupTopicWithExistingFactors,
  visitTopic
} from '../support'

describe('Topic Elements - Permissions and Access Control', () => {
  let testTopic: Topic

  beforeEach(() => {
    ;({ testTopic } = setupTopicWithExistingFactors())
  })

  describe('Access Control', () => {
    it('should not show edit controls for non-owners', () => {
      // Mock topic owned by different user
      const otherUserTopic = createTestTopic({
        ...testTopic,
        owner: {
          id: 'not-current-user',
          first_name: 'Original',
          last_name: 'Owner'
        }
      })

      mockTopicAndRelatedObjects(otherUserTopic, {})
      cy.visit(`/bouquets/${otherUserTopic.slug}`)

      // Verify edit controls are not present
      cy.get('.test__add_dataset_btn').should('not.exist')
      cy.get('.test__edit_factor_btn').should('not.exist')
      cy.get('.test__delete_factor_btn').should('not.exist')

      // Verify permalink button is present for everyone
      cy.get('.test__permalink_factor_btn').should('exist')
    })

    it('should show edit controls for topic owners', () => {
      // Topic is owned by current user
      visitTopic(testTopic.slug)

      // Verify edit controls are present
      cy.get('.test__add_dataset_btn').should('be.visible')
      cy.get('.test__edit_factor_btn').should('exist')
      cy.get('.test__delete_factor_btn').should('exist')
      cy.get('.test__permalink_factor_btn').should('exist')
    })
  })
})
