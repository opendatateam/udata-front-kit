import { discussionFactory } from 'cypress/support/factories/discussions_factory'
import {
  createTestFactors,
  setupTopicWithExistingFactors,
  visitTopic
} from './support'

describe('Topic Detail View - Tab counts', () => {
  it('should show distinct counts on the Données and Discussions tabs', () => {
    const { testTopic } = setupTopicWithExistingFactors({
      factors: createTestFactors(3),
      discussions: discussionFactory.many(5)
    })

    visitTopic(testTopic.slug)
    cy.wait('@getElementsDataset')

    cy.contains('button', `Données (3)`).should('be.visible')
    cy.contains('button', 'Discussions (5)').should('be.visible')
  })
})

describe('Topic Detail View - Discussion deep link', () => {
  it('should open the Discussions tab from a #discussion- hash', () => {
    const discussions = discussionFactory.many(2)
    const target = discussions[1]
    const { testTopic } = setupTopicWithExistingFactors({ discussions })

    cy.visit(`/bouquets/${testTopic.slug}#discussion-${target.id}`)

    cy.location('pathname').should(
      'eq',
      `/bouquets/${testTopic.slug}/discussions`
    )
    cy.url().should('not.include', '#discussion-')
    cy.get('[role="tab"][aria-selected="true"]').should(
      'contain',
      'Discussions'
    )
    cy.get(`#discussion-${target.id}`).should('be.visible')
  })
})
