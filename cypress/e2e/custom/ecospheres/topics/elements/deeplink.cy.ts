import type { Factor, Topic } from '@/model/topic'
import { useAnimationConstants } from '@/utils/constants'
import {
  factorFactory,
  setupTopicWithExistingFactors,
  visitTopic
} from '../support'
import { useWaitConstants } from './constants'

const { HIGHLIGHT_DURATION } = useAnimationConstants()
const { VIEWPORT_WAIT } = useWaitConstants()

describe('Topic Elements - Deep Linking', () => {
  let testTopic: Topic
  let testFactors: Factor[]

  beforeEach(() => {
    ;({ testTopic, testFactors } = setupTopicWithExistingFactors())
  })

  describe('Navigating to a specific factor via URL hash', () => {
    it('should navigate to a factor in a group when hash is present in URL', () => {
      const targetFactor = testFactors[0]
      const factorId = targetFactor.id

      // Visit the topic page with a hash pointing to the factor
      cy.visit(`/bouquets/${testTopic.id}#factor-${factorId}`)

      cy.wait('@getElementsDataset')

      // Verify the factor is visible (group should auto-expand)
      cy.contains(targetFactor.title).should('be.visible')

      // Verify the factor element has the correct ID
      cy.get(`#factor-${factorId}`).should('exist')

      // Verify the factor is scrolled into viewport
      // Wait for smooth scroll animation to complete
      cy.get(`#factor-${factorId}`).isInViewport({ wait: VIEWPORT_WAIT })

      // Verify we're on the "Données" tab
      cy.get('[role="tablist"]')
        .find('[role="tab"][aria-selected="true"]')
        .should('contain', 'Données')
    })

    it('should highlight the target factor temporarily', () => {
      const targetFactor = testFactors[0]
      const factorId = targetFactor.id

      cy.visit(`/bouquets/${testTopic.id}#factor-${factorId}`)
      cy.wait('@getElementsDataset')

      // Wait for smooth scroll animation to complete
      cy.get(`#factor-${factorId}`).isInViewport({ wait: VIEWPORT_WAIT })

      // Verify the factor element gets highlighted
      cy.get(`#factor-${factorId}`).should(($el) => {
        const outline = $el.css('outline')
        // Check that outline is applied (it should be non-empty)
        expect(outline).to.not.include('0px')
      })

      // Wait for highlight to disappear (constant + buffer)
      cy.wait(HIGHLIGHT_DURATION + 500)

      // Verify the highlight is removed
      cy.get(`#factor-${factorId}`).should(($el) => {
        const outline = $el.css('outline')
        // Outline should be removed or set to none/initial
        expect(outline).to.include('0px')
      })
    })

    it('should handle non-existent factor IDs gracefully', () => {
      const nonExistentFactorId = 'factor-does-not-exist'

      // Visit with a hash to a non-existent factor
      cy.visit(`/bouquets/${testTopic.id}#factor-${nonExistentFactorId}`)
      cy.wait('@getElementsDataset')

      // Page should still load normally
      cy.get('[role="tablist"]').should('exist')

      // Element should not exist
      cy.get(`#factor-${nonExistentFactorId}`).should('not.exist')

      // Should be at the top of the page when factor doesn't exist
      cy.window().then((win) => {
        expect(win.scrollY).to.equal(0)
      })
    })

    it('should work with ungrouped factors', () => {
      // Create multiple groups to push down the ungrouped section in viewport
      const groupedFactors = factorFactory.many(10, {
        traits: ['dataset_in_sequential_group']
      })

      // Create ungrouped factors
      const ungroupedFactors = factorFactory.many(2, {
        traits: ['missing_no_group']
      })
      const { testTopic } = setupTopicWithExistingFactors([
        ...ungroupedFactors,
        ...groupedFactors
      ])
      const targetFactor = ungroupedFactors[0]

      if (!targetFactor) throw Error('Could not find any ungrouped factor')

      cy.visit(`/bouquets/${testTopic.id}#factor-${targetFactor.id}`)
      cy.wait('@getElementsNone')

      // Ungrouped factors should be visible by default, and the target should be scrolled to
      // this one can be a bit long to finish scrolling, wait longer
      cy.get(`#factor-${targetFactor.id}`).isInViewport({
        wait: VIEWPORT_WAIT * 2
      })
      cy.contains(targetFactor.title).should('be.visible')
    })
  })

  describe('Tab switching with deep links', () => {
    it('should switch to Données tab when navigating from another tab', () => {
      const targetFactor = testFactors[0]

      // First visit without hash
      visitTopic(testTopic.id)
      cy.wait('@getElementsDataset')

      // Switch to Discussions tab
      cy.get('[role="tab"]').contains('Discussions').click()
      cy.get('[role="tab"][aria-selected="true"]').should(
        'contain',
        'Discussions'
      )

      // Now navigate to a factor via hash
      cy.visit(`/bouquets/${testTopic.id}#factor-${targetFactor.id}`)

      // Should switch back to Données tab
      cy.get('[role="tab"][aria-selected="true"]').should('contain', 'Données')

      // Factor should be visible and scrolled into viewport
      cy.get(`#factor-${targetFactor.id}`).isInViewport({ wait: VIEWPORT_WAIT })
    })

    it('should not interfere with normal tab navigation', () => {
      visitTopic(testTopic.id)
      cy.wait('@getElementsDataset')

      // Click through tabs normally
      cy.get('[role="tab"]').contains('Discussions').click()
      cy.get('[role="tab"][aria-selected="true"]').should(
        'contain',
        'Discussions'
      )

      cy.get('[role="tab"]').contains('Données').click()
      cy.get('[role="tab"][aria-selected="true"]').should('contain', 'Données')
    })

    it('should allow navigating from factor deeplink to another tab', () => {
      const targetFactor = testFactors[0]

      // Start with a factor deeplink
      cy.visit(`/bouquets/${testTopic.id}#factor-${targetFactor.id}`)
      cy.wait('@getElementsDataset')

      // Verify we're on Données tab with factor visible
      cy.get('[role="tab"][aria-selected="true"]').should('contain', 'Données')
      cy.get(`#factor-${targetFactor.id}`).should('be.visible')

      // Switch to Discussions tab
      cy.get('[role="tab"]').contains('Discussions').click()

      // Verify Discussions tab is now active
      cy.get('[role="tab"][aria-selected="true"]').should(
        'contain',
        'Discussions'
      )

      // Factor should no longer be in view (different tab)
      cy.get(`#factor-${targetFactor.id}`).should('not.be.visible')
    })
  })
})
