import { useWaitConstants } from './elements/constants'
import {
  activityFactory,
  createTestFactors,
  expandDisclosureGroup,
  setupTopicWithExistingFactors,
  visitTopic
} from './support'

const { VIEWPORT_WAIT } = useWaitConstants()

describe('Topic Activity List', () => {
  describe('Activity tab visibility', () => {
    it('should show Activity tab for topic owners', () => {
      const { testTopic } = setupTopicWithExistingFactors()
      visitTopic(testTopic.slug)

      cy.wait('@getElementsDataset')

      // Activity tab should be visible for owners
      cy.get('[role="tab"]').contains('Activité').should('be.visible')
    })

    it('should not show Activity tab for non-owners', () => {
      const { testTopic } = setupTopicWithExistingFactors()

      // Disconnect user to simulate non-owner
      cy.simulateDisconnectedUser()

      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')

      // Activity tab should not exist for non-owners
      cy.get('[role="tab"]').contains('Activité').should('not.exist')
    })
  })

  describe('Activity list display', () => {
    it('should display activities when Activity tab is clicked', () => {
      const testFactors = createTestFactors(2)

      const activities = [
        activityFactory.one({ traits: ['topic_created'] }),
        activityFactory.one({
          traits: ['element_created'],
          overrides: { extras: { element_id: testFactors[0].id } }
        }),
        activityFactory.one({ traits: ['topic_updated'] })
      ]

      const { testTopic } = setupTopicWithExistingFactors(
        testFactors,
        activities
      )

      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')

      // Click Activity tab
      cy.get('[role="tab"]').contains('Activité').click()
      cy.wait('@get_activity_list')

      // Should show activity items with translated labels
      cy.contains('a créé le bouquet').should('be.visible')
      cy.contains("a ajouté l'élément").should('be.visible')
      cy.contains('a modifié le bouquet').should('be.visible')
    })
  })

  describe('Activity deep-linking', () => {
    it('should make element activities clickable', () => {
      const testFactors = createTestFactors(2)

      const activities = [
        activityFactory.one({ traits: ['topic_created'] }),
        activityFactory.one({
          traits: ['element_created'],
          overrides: { extras: { element_id: testFactors[0].id } }
        }),
        activityFactory.one({
          traits: ['element_updated'],
          overrides: { extras: { element_id: testFactors[1].id } }
        }),
        activityFactory.one({ traits: ['topic_updated'] })
      ]

      const { testTopic } = setupTopicWithExistingFactors(
        testFactors,
        activities
      )

      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')

      cy.get('[role="tab"]').contains('Activité').click()
      cy.wait('@get_activity_list')

      // Element activities should be links
      cy.contains("a ajouté l'élément")
        .should('have.prop', 'tagName', 'A')
        .and('have.class', 'activity-link')

      cy.contains("a modifié l'élément")
        .should('have.prop', 'tagName', 'A')
        .and('have.class', 'activity-link')
    })

    it('should make non-element activities non-clickable', () => {
      const activities = [
        activityFactory.one({ traits: ['topic_created'] }),
        activityFactory.one({ traits: ['topic_updated'] })
      ]

      const { testTopic } = setupTopicWithExistingFactors(undefined, activities)

      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')

      cy.get('[role="tab"]').contains('Activité').click()
      cy.wait('@get_activity_list')

      // Topic activities should be spans, not buttons
      cy.contains('a créé le bouquet')
        .should('have.prop', 'tagName', 'SPAN')
        .and('not.have.class', 'activity-link')
    })

    it('should make deleted element activities non-clickable', () => {
      const activities = [
        // This won't be linked to a real factor, thus simulating a deleted element activity
        activityFactory.one({
          traits: ['element_updated'],
          overrides: { extras: { element_id: 'deleted-factor-id' } }
        })
      ]

      const { testTopic } = setupTopicWithExistingFactors(undefined, activities)

      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')

      cy.get('[role="tab"]').contains('Activité').click()
      cy.wait('@get_activity_list')

      // Element activity should be spans, not buttons
      cy.contains('a modifié un élément')
        .should('have.prop', 'tagName', 'SPAN')
        .and('not.have.class', 'activity-link')
    })

    it('should navigate to factor when clicking element activity', () => {
      const testFactors = createTestFactors(2)
      const targetFactorId = testFactors[0].id

      const activities = [
        activityFactory.one({
          traits: ['element_created'],
          overrides: {
            extras: { element_id: targetFactorId }
          }
        })
      ]

      const { testTopic } = setupTopicWithExistingFactors(
        testFactors,
        activities
      )

      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')

      cy.get('[role="tab"]').contains('Activité').click()
      cy.wait('@get_activity_list')

      // Click on element activity
      cy.contains("a ajouté l'élément").click()

      // Should navigate to Données tab
      cy.get('[role="tab"][aria-selected="true"]').should('contain', 'Données')

      // Factor should be visible and scrolled into view
      cy.get(`#factor-${targetFactorId}`).isInViewport({ wait: VIEWPORT_WAIT })
    })

    it('should navigate between different factors from activity list', () => {
      const testFactors = createTestFactors(2)
      const firstFactorId = testFactors[0].id
      const secondFactorId = testFactors[1].id

      const activities = [
        activityFactory.one({
          traits: ['element_created'],
          overrides: {
            extras: { element_id: firstFactorId }
          }
        }),
        activityFactory.one({
          traits: ['element_updated'],
          overrides: {
            extras: { element_id: secondFactorId }
          }
        })
      ]

      const { testTopic } = setupTopicWithExistingFactors(
        testFactors,
        activities
      )

      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')

      cy.get('[role="tab"]').contains('Activité').click()
      cy.wait('@get_activity_list')

      // Click first activity
      cy.contains("a ajouté l'élément").click()
      cy.get(`#factor-${firstFactorId}`).isInViewport({ wait: VIEWPORT_WAIT })

      // Go back to Activity tab
      cy.get('[role="tab"]').contains('Activité').click()

      // Click second activity
      cy.contains("a modifié l'élément").click()
      cy.get(`#factor-${secondFactorId}`).isInViewport({ wait: VIEWPORT_WAIT })
    })
  })

  describe('Activity list updates after factor operations', () => {
    it('should update activity list immediately after adding a factor', () => {
      const { testTopic } = setupTopicWithExistingFactors()
      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')

      const newFactor = {
        id: 'new-factor-123',
        title: 'New Test Factor',
        description: 'Newly added factor',
        tags: [],
        extras: { ecospheres: { uri: null, availability: 'not available' } },
        element: null
      }

      cy.intercept('POST', `**/topics/${testTopic.id}/elements/`, {
        statusCode: 201,
        body: [newFactor]
      }).as('createElement')

      const newActivity = activityFactory.one({
        traits: ['element_created'],
        overrides: {
          extras: { element_id: newFactor.id },
          created_at: new Date().toISOString()
        }
      })

      cy.intercept('GET', '**/api/1/activity/**', {
        statusCode: 200,
        body: { data: [newActivity], total: 1, page: 1, page_size: 20 }
      }).as('get_activity_list_updated')

      // Fill in the create form
      cy.get('.test__add_dataset_btn').click()
      cy.get('#input-title').type(newFactor.title)
      cy.get('#input-purpose').type(newFactor.description)
      cy.get(`input[name="source"][value="missing"]`).then(($input) => {
        cy.get(`label[for="${$input.attr('id')}"]`).click()
      })
      cy.get('.test__submit_modal_btn').click()
      cy.wait('@createElement')

      cy.contains(newFactor.title).should('be.visible')

      // Check the activity is refreshed
      cy.get('[role="tab"]').contains('Activité').click()
      cy.wait('@get_activity_list_updated')
      cy.contains("a ajouté l'élément").should('be.visible')
    })

    it('should update activity list immediately after modifying a factor', () => {
      const testFactors = createTestFactors(1)
      const { testTopic } = setupTopicWithExistingFactors(testFactors)
      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')

      const updatedFactor = {
        ...testFactors[0],
        title: 'Modified Factor Title',
        description: 'Modified description'
      }

      cy.intercept(
        'PUT',
        `**/topics/${testTopic.id}/elements/${testFactors[0].id}`,
        { statusCode: 200, body: updatedFactor }
      ).as('updateElement')

      const updateActivity = activityFactory.one({
        traits: ['element_updated'],
        overrides: {
          extras: { element_id: testFactors[0].id },
          created_at: new Date().toISOString()
        }
      })

      cy.intercept('GET', '**/api/1/activity/**', {
        statusCode: 200,
        body: { data: [updateActivity], total: 1, page: 1, page_size: 20 }
      }).as('get_activity_list_updated')

      expandDisclosureGroup()
      cy.contains(testFactors[0].title)
        .closest('li')
        .within(() => {
          cy.get('.test__edit_factor_btn').click()
        })

      // Fill in the edit form
      cy.get('#input-title').clear().type(updatedFactor.title)
      cy.get('#input-purpose').clear().type(updatedFactor.description)
      cy.get('.test__submit_modal_btn').click()
      cy.wait('@updateElement')

      // Check the activity is refreshed
      cy.get('[role="tab"]').contains('Activité').click()
      cy.wait('@get_activity_list_updated')
      cy.contains("a modifié l'élément").should('be.visible')
    })

    it('should update activity list immediately after deleting a factor', () => {
      const testFactors = createTestFactors(1)
      const { testTopic } = setupTopicWithExistingFactors(testFactors)
      visitTopic(testTopic.slug)
      cy.wait('@getElementsDataset')

      cy.intercept(
        'DELETE',
        `**/topics/${testTopic.id}/elements/${testFactors[0].id}`,
        { statusCode: 204 }
      ).as('deleteElement')

      const deleteActivity = activityFactory.one({
        traits: ['element_deleted'],
        overrides: { created_at: new Date().toISOString() }
      })

      cy.intercept('GET', '**/api/1/activity/**', {
        statusCode: 200,
        body: { data: [deleteActivity], total: 1, page: 1, page_size: 20 }
      }).as('get_activity_list_updated')

      // Delete the factor
      expandDisclosureGroup()
      cy.contains(testFactors[0].title)
        .closest('li')
        .within(() => {
          cy.get('.test__delete_factor_btn').click()
        })
      cy.wait('@deleteElement')

      // Check the activity is refreshed
      cy.get('[role="tab"]').contains('Activité').click()
      cy.wait('@get_activity_list_updated')
      cy.contains('a supprimé un élément').should('be.visible')
    })
  })
})
