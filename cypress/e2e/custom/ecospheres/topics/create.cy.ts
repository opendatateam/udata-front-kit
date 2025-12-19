import type { Topic } from '@/model/topic'

describe('Ecospheres - Topic (Bouquet) Creation', () => {
  const universeTag =
    Cypress.env('siteConfig').pages.bouquets.universe_query.tag

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    cy.mockSpatialLevels()

    // Simulate connected user with permissions to create topics
    cy.simulateConnectedUser({
      id: 'test-user-id',
      first_name: 'Test',
      last_name: 'User'
    })
  })

  it('should create a bouquet with correctly formatted tags from filter selection', () => {
    // Visit the bouquet creation page
    cy.visit('/admin/bouquets/add')

    // Mock the POST request for creating the topic/bouquet
    cy.intercept('POST', '**/topics/', (req) => {
      // Create a response based on the request body
      const createdTopic: Topic = {
        ...req.body,
        id: 'created-topic-id-123',
        slug: 'test-bouquet-slug',
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
        page: 'bouquets'
      }

      req.reply({
        statusCode: 201,
        body: createdTopic
      })
    }).as('createTopic')

    // Fill in the required form fields
    cy.get('#input-name').type('Test Bouquet for Filter Tags')
    cy.get('#input-description').type(
      'This bouquet tests that filter selections generate correct tag payloads'
    )

    // Select a theme from the filter dropdown
    // Selecting "Mieux consommer" should generate tag: "ecospheres-theme-mieux-consommer"
    cy.get('#input-theme').select('mieux-consommer')

    // Submit the form
    cy.contains('button', 'Enregistrer').click()

    // Verify the API call was made with correct structure and tags
    cy.wait('@createTopic').then((interception) => {
      const requestBody = interception.request.body

      expect(requestBody).to.have.property(
        'name',
        'Test Bouquet for Filter Tags'
      )
      expect(requestBody).to.have.property('description')
      expect(requestBody).to.have.property('tags')

      expect(requestBody.tags).to.be.an('array')
      expect(requestBody.tags).to.include('ecospheres-theme-mieux-consommer')

      // The tags should also include the universe query tag
      expect(requestBody.tags).to.include(universeTag)
    })

    // Verify redirect to the detail page (optional but good practice)
    cy.url().should('match', /\/bouquets\/test-bouquet-slug/)
  })

  it('should populate tags from query string filters on initial load', () => {
    // Visit the bouquet creation page with theme filter in query string
    cy.visit('/admin/bouquets/add?theme=mieux-se-loger')

    // The form should pre-populate with the theme from query string
    cy.get('#input-theme').should('have.value', 'mieux-se-loger')
  })
})
