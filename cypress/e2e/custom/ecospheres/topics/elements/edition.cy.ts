import type { Factor, Topic } from '@/model/topic'
import {
  expandDisclosureGroup,
  setupTopicWithExistingFactors,
  visitTopic
} from '../support'

describe('Topic Elements - Factor Edition', () => {
  let testTopic: Topic
  let testFactors: Factor[]

  beforeEach(() => {
    ;({ testTopic, testFactors } = setupTopicWithExistingFactors())
  })

  describe('Editing Existing Factors', () => {
    beforeEach(() => {
      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')
    })

    it('should edit an existing factor title and description', () => {
      const updatedFactor = {
        ...testFactors[0],
        title: 'Updated Factor Title',
        description: 'Updated factor description'
      }

      // Mock the PUT request for updating element
      cy.intercept(
        'PUT',
        `**/topics/${testTopic.id}/elements/${testFactors[0].id}`,
        {
          statusCode: 200,
          body: updatedFactor
        }
      ).as('updateElement')

      // Find and expand the "Test Group" containing our test factors
      expandDisclosureGroup()

      // Now click the edit button for the first factor
      cy.contains(testFactors[0].title)
        .closest('li')
        .within(() => {
          cy.get('.test__edit_factor_btn').click()
        })

      // Update the form fields
      cy.get('#input-title').clear().type(updatedFactor.title)
      cy.get('#input-purpose').clear().type(updatedFactor.description)

      // Submit the form
      cy.get('.test__submit_modal_btn').click()

      // Verify API call was made
      cy.wait('@updateElement').then((interception) => {
        expect(interception.request.body).to.include({
          title: updatedFactor.title,
          description: updatedFactor.description
        })
      })

      // Verify the updated factor appears in the DOM (updated locally, no refetch)
      cy.contains(updatedFactor.title).should('be.visible')
      cy.contains(testFactors[0].title).should('not.exist')
    })

    it('should rename a group', () => {
      const originalGroupName = 'Test Group'
      const newGroupName = 'Data Collection'

      // Mock PUT requests for updating each factor in the group
      testFactors.forEach((factor, index) => {
        cy.intercept('PUT', `**/topics/${testTopic.id}/elements/${factor.id}`, {
          statusCode: 200,
          body: {
            ...factor,
            extras: {
              ...factor.extras,
              ecospheres: {
                ...factor.extras.ecospheres,
                group: newGroupName
              }
            }
          }
        }).as(`updateElement${index}`)
      })

      // Find and expand the "Test Group" containing our test factors
      expandDisclosureGroup()

      // Click the edit group button using the test class
      cy.get('.test__edit_group_btn').click()

      // Wait for modal to be visible and input to be ready
      cy.get('.modal-group input').should('be.visible')

      // Update the group name in the modal - use {selectall} to ensure clearing works in all browsers
      cy.get('.modal-group input')
        .focus()
        .type('{selectall}')
        .type(newGroupName)

      // Verify the input value is correct
      cy.get('.modal-group input').should('have.value', newGroupName)

      // Submit the form
      cy.get('.modal-group .fr-btns-group button').last().click()

      // Verify API calls were made for each factor
      testFactors.forEach((_, index) => {
        cy.wait(`@updateElement${index}`).then((interception) => {
          expect(interception.request.body.extras.ecospheres.group).to.equal(
            newGroupName
          )
        })
      })

      // Verify the group name is updated in the DOM
      cy.contains('.disclosure__name', newGroupName).should('be.visible')
      cy.contains('.disclosure__name', originalGroupName).should('not.exist')

      // Expand the renamed group to verify factors are still there
      expandDisclosureGroup(newGroupName)

      // Verify factors are still visible in the renamed group
      cy.contains(testFactors[0].title).should('be.visible')
      cy.contains(testFactors[1].title).should('be.visible')
    })
  })
})
