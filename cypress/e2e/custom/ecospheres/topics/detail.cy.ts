import type { Discussion } from '@/model/discussion'
import { UserFactory } from 'cypress/support/factories/users_factory'
import {
  createTestFactors,
  createTestTopicWithElements,
  mockTopicAndRelatedObjects,
  mockTopicElementsByClass,
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
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    cy.simulateDisconnectedUser()

    const testFactors = createTestFactors(3)
    const testTopic = createTestTopicWithElements(testFactors)

    mockTopicAndRelatedObjects(testTopic, { factors: testFactors })
    mockTopicElementsByClass(testTopic.id, testFactors, [], [])
    // override mockTopicAndRelatedObjects' default empty discussions mock
    cy.mockDatagouvObjectList('discussions', buildDiscussions(5, testTopic.id))

    visitTopic(testTopic.slug)
    cy.wait('@getElementsDataset')

    cy.contains('button', 'Données (3)').should('be.visible')
    cy.contains('button', 'Discussions (5)').should('be.visible')
  })
})
