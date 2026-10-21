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
    cy.contains('button', 'Envoyer').click()

    cy.wait('@createDiscussion')
      .its('request.body.extras.notification.external_url')
      .should('match', new RegExp(`/bouquets/${testTopic.slug}/discussions$`))
  })

  // target is not in the first page of the list: it is fetched on its own
  const setupDeeplinkedDiscussion = () => {
    const firstPage = discussionFactory.many(2)
    const { testTopic } = setupTopicWithExistingFactors({
      discussions: firstPage
    })
    const target = discussionFactory.one({
      overrides: { subject: { class: 'Topic', id: testTopic.id } }
    })
    cy.mockDatagouvObject('discussions', target.id, target)
    return { testTopic, firstPage, target }
  }

  const assertSingleDiscussion = (slug: string, targetId: string) => {
    cy.location('pathname').should('eq', `/bouquets/${slug}/discussions`)
    cy.location('search').should('eq', `?discussion_id=${targetId}`)
    cy.location('hash').should('eq', '')
    cy.get('[role="tab"][aria-selected="true"]').should(
      'contain',
      'Discussions'
    )
    cy.contains('a', 'Voir toutes les discussions').should('be.visible')
    cy.get(`#discussion-${targetId}`).should('be.visible')
  }

  // udata appends #discussion-{id} to the notification external_url
  it('should open a single discussion from a /discussions#discussion- link', () => {
    const { testTopic, firstPage, target } = setupDeeplinkedDiscussion()

    cy.visit(`/bouquets/${testTopic.slug}/discussions#discussion-${target.id}`)

    assertSingleDiscussion(testTopic.slug, target.id)
    cy.get(`#discussion-${firstPage[0].id}`).should('not.exist')
  })

  // bare URL + hash: format stored on discussions created before the tab was in the path
  it('should open a single discussion from a bare #discussion- link', () => {
    const { testTopic, target } = setupDeeplinkedDiscussion()

    cy.visit(`/bouquets/${testTopic.slug}#discussion-${target.id}`)

    assertSingleDiscussion(testTopic.slug, target.id)
  })

  it('should go back to all discussions from a single discussion', () => {
    const { testTopic, firstPage, target } = setupDeeplinkedDiscussion()

    cy.visit(
      `/bouquets/${testTopic.slug}/discussions?discussion_id=${target.id}`
    )
    cy.get(`#discussion-${target.id}`).should('be.visible')
    cy.contains('a', 'Voir toutes les discussions').click()

    cy.location('pathname').should(
      'eq',
      `/bouquets/${testTopic.slug}/discussions`
    )
    cy.location('search').should('eq', '')
    cy.get(`#discussion-${firstPage[0].id}`).should('be.visible')
    cy.get(`#discussion-${target.id}`).should('not.exist')
  })

  it('should fall back to all discussions for a discussion of another subject', () => {
    const { testTopic, firstPage } = setupDeeplinkedDiscussion()
    const foreign = discussionFactory.one()
    cy.mockDatagouvObject('discussions', foreign.id, foreign)

    cy.visit(`/bouquets/${testTopic.slug}#discussion-${foreign.id}`)

    cy.location('pathname').should(
      'eq',
      `/bouquets/${testTopic.slug}/discussions`
    )
    cy.location('search').should('eq', '')
    cy.get(`#discussion-${firstPage[0].id}`).should('be.visible')
  })

  it('should copy a permalink to a discussion', () => {
    const { testTopic, firstPage } = setupDeeplinkedDiscussion()

    cy.visit(`/bouquets/${testTopic.slug}/discussions`, {
      onBeforeLoad(win) {
        cy.stub(win.navigator.clipboard, 'writeText').as('writeText').resolves()
      }
    })
    cy.get(`#discussion-${firstPage[0].id}`)
      .parent()
      .contains('button', 'Copier le lien vers cette discussion')
      .click()

    cy.get('@writeText').should(
      'have.been.calledWith',
      `${Cypress.config('baseUrl')}/bouquets/${testTopic.slug}/discussions?discussion_id=${firstPage[0].id}`
    )
  })
})
