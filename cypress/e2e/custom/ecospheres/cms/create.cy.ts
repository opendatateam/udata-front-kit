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
    cy.contains('label', 'En votre propre nom').click()
    cy.contains('button', 'Créer la page').click()

    cy.wait('@createPage').then((interception) => {
      const requestBody = interception.request.body
      expect(requestBody).to.have.property('name', 'Test CMS Page')
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

  it('should block creating a page as an organization with none selected', () => {
    cy.visit('/admin/cms/add')

    cy.get('#input-name').type('Test CMS Page')
    // "En tant qu'organisation" is the default choice — left untouched, no
    // organization picked, so submitting shouldn't call the create API at all
    // (catchUnmockedRequests fails the test if it does)
    cy.contains('button', 'Créer la page').click()

    cy.contains('Veuillez sélectionner une organisation').should('be.visible')
    cy.url().should('include', '/admin/cms/add')
  })
})
