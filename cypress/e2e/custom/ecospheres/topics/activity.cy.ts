import {
  activityFactory,
  createTestFactors,
  setupTopicWithExistingFactors,
  visitTopic
} from './elements/support'

describe('Topic Activity List', () => {
  describe('Activity tab visibility', () => {
    it('should show Activity tab for topic owners', () => {
      const { testTopic } = setupTopicWithExistingFactors()
      visitTopic(testTopic.id)

      cy.wait('@getElementsDataset')

      // Activity tab should be visible for owners
      cy.get('[role="tab"]').contains('Activité').should('be.visible')
    })

    it('should not show Activity tab for non-owners', () => {
      const { testTopic } = setupTopicWithExistingFactors()

      // Disconnect user to simulate non-owner
      cy.simulateDisconnectedUser()

      visitTopic(testTopic.id)
      cy.wait('@getElementsDataset')

      // Activity tab should not exist for non-owners
      cy.get('[role="tab"]').contains('Activité').should('not.exist')
    })
  })

  describe('Activity list display', () => {
    it('should display activities when Activity tab is clicked', () => {
      const testFactors = createTestFactors(2, ['dataset_in_group'])

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

      visitTopic(testTopic.id)
      cy.wait('@getElementsDataset')

      // Click Activity tab
      cy.get('[role="tab"]').contains('Activité').click()
      cy.wait('@get_activity_list')

      // Should show activity items with translated labels
      cy.contains('a créé le bouquet').should('be.visible')
      cy.contains('a ajouté le facteur').should('be.visible')
      cy.contains('a modifié le bouquet').should('be.visible')
    })
  })

  describe('Activity deep-linking', () => {
    it('should make element activities clickable', () => {
      const testFactors = createTestFactors(2, ['dataset_in_group'])

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

      visitTopic(testTopic.id)
      cy.wait('@getElementsDataset')

      cy.get('[role="tab"]').contains('Activité').click()
      cy.wait('@get_activity_list')

      // Element activities should be links
      cy.contains('a ajouté le facteur')
        .should('have.prop', 'tagName', 'A')
        .and('have.class', 'activity-link')

      cy.contains('a modifié le')
        .should('have.prop', 'tagName', 'A')
        .and('have.class', 'activity-link')
    })

    it('should make non-element activities non-clickable', () => {
      const activities = [
        activityFactory.one({ traits: ['topic_created'] }),
        activityFactory.one({ traits: ['topic_updated'] })
      ]

      const { testTopic } = setupTopicWithExistingFactors(undefined, activities)

      visitTopic(testTopic.id)
      cy.wait('@getElementsDataset')

      cy.get('[role="tab"]').contains('Activité').click()
      cy.wait('@get_activity_list')

      // Topic activities should be spans, not buttons
      cy.contains('a créé le bouquet')
        .should('have.prop', 'tagName', 'SPAN')
        .and('not.have.class', 'activity-link')
    })

    it('should navigate to factor when clicking element activity', () => {
      const testFactors = createTestFactors(2, ['dataset_in_group'])
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

      visitTopic(testTopic.id)
      cy.wait('@getElementsDataset')

      cy.get('[role="tab"]').contains('Activité').click()
      cy.wait('@get_activity_list')

      // Click on element activity
      cy.contains('a ajouté le facteur').click()

      // Should navigate to Données tab
      cy.get('[role="tab"][aria-selected="true"]').should('contain', 'Données')

      // URL should have factor hash
      cy.location('hash').should('eq', `#factor-${targetFactorId}`)

      // Factor should be visible and scrolled into view
      cy.get(`#factor-${targetFactorId}`).isInViewport({ wait: 300 })
    })

    it('should navigate between different factors from activity list', () => {
      const testFactors = createTestFactors(2, ['dataset_in_group'])
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

      visitTopic(testTopic.id)
      cy.wait('@getElementsDataset')

      cy.get('[role="tab"]').contains('Activité').click()
      cy.wait('@get_activity_list')

      // Click first activity
      cy.contains('a ajouté le facteur').click()
      cy.wait(500) // Wait for scroll animation
      cy.get(`#factor-${firstFactorId}`).isInViewport({ wait: 300 })

      // Go back to Activity tab
      cy.get('[role="tab"]').contains('Activité').click()

      // Click second activity
      cy.contains('a modifié le facteur').click()
      cy.wait(500) // Wait for scroll animation
      cy.get(`#factor-${secondFactorId}`).isInViewport({ wait: 300 })
    })
  })
})
