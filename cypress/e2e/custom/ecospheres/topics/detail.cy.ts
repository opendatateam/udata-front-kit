import type { Discussion } from '@/model/discussion'
import { UserFactory } from 'cypress/support/factories/users_factory'
import {
  createTestFactors,
  setupTopicWithExistingFactors,
  visitTopic
} from './support'

function buildDiscussions(count: number, topicId: string): Discussion[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `discussion-${i}`,
    title: `Discussion ${i}`,
    subject: { class: 'Topic' as const, id: topicId },
    discussion: [
      {
        content: 'Sample comment',
        posted_by: UserFactory.one(),
        posted_on: new Date().toISOString()
      }
    ]
  }))
}

describe('Topic Detail View - Tab counts', () => {
  it('should show distinct counts on the Données and Discussions tabs', () => {
    const { testTopic, testFactors } = setupTopicWithExistingFactors(
      createTestFactors(3)
    )
    // override setupTopicWithExistingFactors' default empty discussions mock
    cy.mockDatagouvObjectList('discussions', buildDiscussions(5, testTopic.id))

    visitTopic(testTopic.slug)
    cy.wait('@getElementsDataset')

    cy.contains('button', `Données (${testFactors.length})`).should(
      'be.visible'
    )
    cy.contains('button', 'Discussions (5)').should('be.visible')
  })
})
