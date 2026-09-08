import { discussionFactory } from 'cypress/support/factories/discussions_factory'
import {
  createTestFactors,
  setupTopicWithExistingFactors,
  visitTopic
} from './support'

describe('Topic Detail View - Tab counts', () => {
  it('should show distinct counts on the Données and Discussions tabs', () => {
    const { testTopic, testFactors } = setupTopicWithExistingFactors({
      factors: createTestFactors(3),
      discussions: discussionFactory.many(5)
    })

    visitTopic(testTopic.slug)
    cy.wait('@getElementsDataset')

    cy.contains('button', `Données (${testFactors.length})`).should(
      'be.visible'
    )
    cy.contains('button', 'Discussions (5)').should('be.visible')
  })
})
