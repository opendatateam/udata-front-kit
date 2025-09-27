import type { Topic } from '@/model/topic'
import {
  createTestTopic,
  mockTopicAndDiscussions,
  setupTopicWithExistingFactors,
  visitTopic
} from './support'

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

      mockTopicAndDiscussions(otherUserTopic)
      cy.visit(`/bouquets/${otherUserTopic.id}`)

      // Verify edit controls are not present
      cy.get('.test__add_dataset_btn').should('not.exist')
      cy.get('.test__edit_factor_btn').should('not.exist')
      cy.get('.test__delete_factor_btn').should('not.exist')
    })

    it('should show edit controls for topic owners', () => {
      // Topic is owned by current user
      visitTopic(testTopic.id)

      // Verify edit controls are present
      cy.get('.test__add_dataset_btn').should('be.visible')
      cy.get('.test__edit_factor_btn').should('have.length.at.least', 1)
      cy.get('.test__delete_factor_btn').should('have.length.at.least', 1)
    })
  })
})
