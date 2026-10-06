import { createTestTopic } from '../topics/support'
import { createTestPage } from './support'

describe('Ecospheres - CMS Page Creation', () => {
  const topicId = Cypress.env('siteConfig').website.cms.topic_id

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()

    cy.simulateConnectedUser({
      id: 'test-user-id',
      first_name: 'Test',
      last_name: 'User'
    })

    // the admin route is guarded by edit rights on this topic
    const cmsTopic = createTestTopic({ id: topicId })
    cy.mockDatagouvObject('topics', cmsTopic.id, cmsTopic)
  })

  it('should create a page owned by the current user and redirect to its edit view', () => {
    cy.visit('/admin/cms/add')

    const createdPage = createTestPage({ slug: 'test-cms-page' })

    cy.intercept('POST', '**/pages/', (req) => {
      req.reply({ statusCode: 201, body: { ...createdPage, ...req.body } })
    }).as('createPage')

    // links the new page to the CMS topic right after creation
    cy.intercept('POST', `**/topics/${topicId}/elements/`, (req) => {
      req.reply({
        statusCode: 201,
        body: [{ ...req.body[0], id: 'created-element-id' }]
      })
    }).as('createElement')

    // mocks what the edit view loads right after the redirect
    cy.mockDatagouvObject('pages', createdPage.id, createdPage)

    cy.get('#input-name').type('Test CMS Page')
    // owner is inherited from the CMS topic, not chosen by the user
    cy.contains("Cette page appartiendra à l'utilisateur Test User").should(
      'be.visible'
    )
    cy.contains('button', 'Créer la page').click()

    cy.wait('@createPage').then((interception) => {
      const requestBody = interception.request.body
      expect(requestBody).to.have.property('name', 'Test CMS Page')
      expect(requestBody).to.have.property('owner', 'test-user-id')
      expect(requestBody).to.have.property('tags')
      expect(requestBody.tags).to.be.an('array')
    })

    cy.wait('@createElement').then((interception) => {
      const [element] = interception.request.body
      expect(element.element).to.deep.equal({
        class: 'Page',
        id: createdPage.id
      })
    })

    cy.url().should('match', new RegExp(`/admin/cms/edit/${createdPage.id}`))
  })
})
