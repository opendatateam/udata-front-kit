import type { Factor, Topic } from '@/model/topic'
import {
  expandDisclosureGroup,
  setupTopicWithExistingFactors,
  visitTopic
} from './support'

describe('Topic Elements - Factor Deletion', () => {
  let testTopic: Topic
  let testFactors: Factor[]

  beforeEach(() => {
    ;({ testTopic, testFactors } = setupTopicWithExistingFactors())
  })

  describe('Deleting Factors', () => {
    beforeEach(() => {
      visitTopic(testTopic.slug)
    })

    it('should only fire delete request after user confirms', () => {
      // Mock the DELETE request
      cy.intercept(
        'DELETE',
        `**/topics/${testTopic.id}/elements/${testFactors[0].id}`,
        {
          statusCode: 204
        }
      ).as('deleteElement')

      // Find and expand the "Test Group" containing our test factors
      expandDisclosureGroup()

      // Click delete button for first factor
      cy.contains(testFactors[0].title)
        .closest('li')
        .within(() => {
          cy.get('.test__delete_factor_btn').click()
        })

      // Cypress auto-accepts browser confirm() dialogs by default, request is fired immediately
      cy.wait('@deleteElement')

      // Verify the factor is removed from the list (updated locally, no refetch)
      cy.contains(testFactors[0].title).should('not.exist')
      cy.contains(testFactors[1].title).should('be.visible')
    })

    it('should not fire delete request if user cancels confirmation', () => {
      // Mock the DELETE request to ensure it's NOT called
      cy.intercept(
        'DELETE',
        `**/topics/${testTopic.id}/elements/${testFactors[0].id}`,
        {
          statusCode: 204
        }
      ).as('deleteElement')

      // Stub window.confirm to return false (user cancels)
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(false)
      })

      // Find and expand the "Test Group" containing our test factors
      expandDisclosureGroup()

      // Click delete button for first factor
      cy.contains(testFactors[0].title)
        .closest('li')
        .within(() => {
          cy.get('.test__delete_factor_btn').click()
        })

      // Verify that NO API call was made
      cy.get('@deleteElement.all').should('have.length', 0)

      // Verify the factor is still in the list
      cy.contains(testFactors[0].title).should('be.visible')
      cy.contains(testFactors[1].title).should('be.visible')
    })
  })

  describe('Deleting Groups', () => {
    beforeEach(() => {
      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')
    })

    it('should delete a group and all its factors', () => {
      const groupName = 'Test Group'

      // Mock DELETE requests for each factor in the group
      testFactors.forEach((factor, index) => {
        cy.intercept(
          'DELETE',
          `**/topics/${testTopic.id}/elements/${factor.id}`,
          {
            statusCode: 204
          }
        ).as(`deleteElement${index}`)
      })

      // Find and expand the "Test Group" containing our test factors
      expandDisclosureGroup()

      // Verify factors are initially visible
      cy.contains(testFactors[0].title).should('be.visible')
      cy.contains(testFactors[1].title).should('be.visible')

      // Click the delete group button using the test class
      cy.get('.test__delete_group_btn').click()

      // Confirm deletion in the modal
      cy.get('.modal-group .fr-btns-group button').last().click()

      // Verify API calls were made for each factor
      testFactors.forEach((_, index) => {
        cy.wait(`@deleteElement${index}`)
      })

      // Verify the group and its factors are no longer visible
      cy.contains('.disclosure__name', groupName).should('not.exist')
      cy.contains(testFactors[0].title).should('not.exist')
      cy.contains(testFactors[1].title).should('not.exist')

      // Verify empty state message appears
      cy.contains('ne contient pas encore de donnée').should('be.visible')
    })
  })
})
