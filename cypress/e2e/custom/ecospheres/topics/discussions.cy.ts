import type { Discussion } from '@/model/discussion'
import { discussionFactory } from 'cypress/support/factories/discussions_factory'
import { OrganizationReferenceFactory } from 'cypress/support/factories/organizations_factory'
import { UserReferenceFactory } from 'cypress/support/factories/users_factory'
import { setupTopicWithExistingFactors, visitTopic } from './support'

const testUser = UserReferenceFactory.one({
  overrides: { id: 'test-user-id', first_name: 'Test', last_name: 'User' }
})

function openDiscussionsTab() {
  cy.wait('@get_discussions_list')
  cy.get('[role="tab"]').contains('Discussions').click()
}

describe('Topic Discussions', () => {
  it('should display existing discussions', () => {
    const discussion = discussionFactory.one({
      overrides: { title: 'An existing discussion' }
    })
    const { testTopic } = setupTopicWithExistingFactors({
      discussions: [discussion]
    })
    visitTopic(testTopic.slug)
    openDiscussionsTab()

    cy.contains(discussion.title).should('be.visible')
    cy.contains(discussion.discussion[0].content).should('be.visible')
  })

  it('should create a new discussion', () => {
    const { testTopic } = setupTopicWithExistingFactors()
    visitTopic(testTopic.slug)
    openDiscussionsTab()

    const newDiscussion = discussionFactory.one({
      overrides: {
        title: 'New e2e discussion',
        subject: { class: 'Topic', id: testTopic.id },
        discussion: [
          {
            id: 'new-comment-id',
            content: 'Hello from e2e',
            posted_by: testUser,
            posted_by_organization: null,
            posted_on: new Date().toISOString(),
            permissions: { delete: true, edit: true }
          }
        ]
      }
    })

    cy.intercept('POST', '**/api/*/discussions/', {
      statusCode: 201,
      body: newDiscussion
    }).as('createDiscussion')
    // Re-registering the same alias: the component reloads the list after
    // creating, and this intercept (registered later) wins for that request.
    cy.mockDatagouvObjectList('discussions', [newDiscussion])

    cy.contains('button', 'Démarrer une nouvelle discussion').click()
    cy.get('#discussion-title').type(newDiscussion.title)
    cy.get('#discussion-message').type('Hello from e2e')
    cy.contains('button', 'Envoyer').click()

    cy.wait('@createDiscussion')
    cy.wait('@get_discussions_list')
    cy.contains(newDiscussion.title).should('be.visible')
  })

  it('should reply to a discussion', () => {
    const discussion = discussionFactory.one()
    const { testTopic } = setupTopicWithExistingFactors({
      discussions: [discussion]
    })
    visitTopic(testTopic.slug)
    openDiscussionsTab()

    const updatedDiscussion: Discussion = {
      ...discussion,
      discussion: [
        ...discussion.discussion,
        {
          id: 'reply-comment-id',
          content: 'A reply from e2e',
          posted_by: testUser,
          posted_by_organization: null,
          posted_on: new Date().toISOString(),
          permissions: { delete: true, edit: true }
        }
      ]
    }

    cy.intercept('POST', `**/api/*/discussions/${discussion.id}/`, {
      statusCode: 200,
      body: updatedDiscussion
    }).as('reply')

    cy.contains('button', 'Répondre').click()
    cy.get('#input-discussion-comment').type('A reply from e2e')
    cy.contains('button', 'Répondre').click()

    cy.wait('@reply')
    cy.contains('A reply from e2e').should('be.visible')
  })

  it('should let the owner edit and delete their discussion', () => {
    const discussion = discussionFactory.one({
      overrides: { permissions: { delete: true, edit: true, close: false } }
    })
    const { testTopic } = setupTopicWithExistingFactors({
      discussions: [discussion]
    })
    visitTopic(testTopic.slug)
    openDiscussionsTab()

    const updatedDiscussion: Discussion = {
      ...discussion,
      title: 'An edited title'
    }
    cy.intercept('PUT', `**/api/*/discussions/${discussion.id}/`, {
      statusCode: 200,
      body: updatedDiscussion
    }).as('editDiscussion')

    cy.get('[title="Modifier la discussion"]').click()
    cy.get('input[name="title"]').clear().type('An edited title')
    cy.contains('button', 'Mettre à jour').click()
    cy.wait('@editDiscussion')
    cy.contains('An edited title').should('be.visible')

    cy.intercept('DELETE', `**/api/*/discussions/${discussion.id}/`, {
      statusCode: 204
    }).as('deleteDiscussion')

    cy.get('[title="Supprimer la discussion"]').click()
    cy.wait('@deleteDiscussion')
    cy.contains('An edited title').should('not.exist')
  })

  it('should post a reply as an organization when one is selected', () => {
    const organization = OrganizationReferenceFactory.one({
      overrides: { id: 'test-org-id', name: 'Test Org' }
    })
    const discussion = discussionFactory.one()
    const { testTopic } = setupTopicWithExistingFactors({
      discussions: [discussion]
    })

    // Override the connected user to also belong to an organization
    cy.simulateConnectedUser({
      id: testUser.id,
      first_name: testUser.first_name,
      last_name: testUser.last_name,
      organizations: [organization]
    })

    visitTopic(testTopic.slug)
    openDiscussionsTab()

    const updatedDiscussion: Discussion = {
      ...discussion,
      discussion: [
        ...discussion.discussion,
        {
          id: 'org-reply-comment-id',
          content: 'A reply as an organization',
          posted_by: testUser,
          posted_by_organization: organization,
          posted_on: new Date().toISOString(),
          permissions: { delete: true, edit: true }
        }
      ]
    }

    cy.intercept('POST', `**/api/*/discussions/${discussion.id}/`, {
      statusCode: 200,
      body: updatedDiscussion
    }).as('replyAsOrg')

    cy.contains('button', 'Répondre').click()
    cy.get('#input-discussion-comment')
      .closest('form')
      .find('select')
      .select(organization.name)
    cy.get('#input-discussion-comment').type('A reply as an organization')
    cy.contains('button', 'Répondre').click()

    cy.wait('@replyAsOrg').then((interception) => {
      expect(interception.request.body.organization).to.equal(organization.id)
    })
    cy.contains('Test Org').should('be.visible')
  })
})
