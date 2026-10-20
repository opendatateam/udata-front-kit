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

describe('Topic Detail View - Discussion notification links', () => {
  it('should send a notification URL pointing to the Discussions tab', () => {
    const { testTopic } = setupTopicWithExistingFactors()
    cy.intercept('POST', /data\.gouv\.fr\/api\/1\/discussions\/?$/, {
      statusCode: 201,
      body: discussionFactory.one()
    }).as('createDiscussion')

    cy.visit(`/bouquets/${testTopic.slug}/discussions`)
    cy.contains('button', 'Démarrer une nouvelle discussion').click()
    cy.get('#discussion-title').type('Titre')
    cy.get('#discussion-message').type('Message')
    cy.contains('button', 'Soumettre').click()

    cy.wait('@createDiscussion')
      .its('request.body.extras.notification.external_url')
      .should('match', new RegExp(`/bouquets/${testTopic.slug}/discussions$`))
  })

  // bare URL + hash: format stored on discussions created before the tab was in the path
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
