import type { Topic } from '@/model/topic'
import { topicFactory } from 'cypress/support/factories/topics_factory'

describe('Topics - List Page', () => {
  let testTopics: Topic[]

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    cy.mockSpatialLevels()
    testTopics = topicFactory.many(3)
  })

  describe('List Display', () => {
    it('should display the list of topics', () => {
      cy.mockDatagouvObjectList('topics', testTopics)

      cy.visit('/bouquets')
      cy.wait('@get_topics_list')

      // Check that all topics are displayed
      testTopics.forEach((topic) => {
        cy.contains(topic.name).should('be.visible')
      })
    })
  })

  describe('Draft Checkbox', () => {
    it('should not show "Afficher les brouillons" checkbox when disconnected', () => {
      // Mock topics list without authenticated user
      cy.mockDatagouvObjectList('topics', testTopics)

      cy.visit('/bouquets')
      cy.wait('@get_topics_list')

      // Verify the checkbox does not exist
      cy.contains('Afficher les brouillons').should('not.exist')
    })

    it('should show "Afficher les brouillons" checkbox when connected', () => {
      // Simulate connected user
      cy.simulateConnectedUser({
        id: 'test-user-id',
        first_name: 'Test',
        last_name: 'User'
      })

      // Mock topics list
      cy.mockDatagouvObjectList('topics', testTopics)

      cy.visit('/bouquets')
      cy.wait('@get_topics_list')

      // Verify the checkbox exists and is visible
      cy.contains('Afficher les brouillons').should('be.visible')
    })

    it('should update URL parameter when clicking "Afficher les brouillons"', () => {
      // Simulate connected user
      cy.simulateConnectedUser({
        id: 'test-user-id',
        first_name: 'Test',
        last_name: 'User'
      })

      // Mock topics list
      cy.mockDatagouvObjectList('topics', testTopics)

      cy.visit('/bouquets')
      cy.wait('@get_topics_list')

      // Initially, include_private should not be in URL
      cy.url().should('not.include', 'include_private')

      // Verify the checkbox is checked by default
      cy.contains('Afficher les brouillons')
        .parent()
        .find('input[type="checkbox"]')
        .should('be.checked')

      // Click the checkbox to hide drafts
      cy.contains('Afficher les brouillons').click()

      // Verify URL includes include_private=false
      cy.url().should('include', 'include_private=false')

      // Wait for the API call with the new parameter
      cy.wait('@get_topics_list')

      // Click again to show drafts
      cy.contains('Afficher les brouillons').click()

      // Verify URL includes include_private=false or doesn't include the parameter
      cy.url().should('include', 'include_private=true')
    })
  })
})
