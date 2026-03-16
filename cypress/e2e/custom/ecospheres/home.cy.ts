import { topicFactory } from 'cypress/support/factories/topics_factory'

describe('Home Page Ecologie', () => {
  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    cy.mockSpatialLevels()
    cy.mockDatagouvObjectList('topics', [])
  })

  it('displays user first name and last name on homepage when connected', () => {
    cy.simulateConnectedUser({
      first_name: 'John',
      last_name: 'Doe'
    })

    cy.visit('/')

    cy.contains('John Doe').should('be.visible')
  })

  describe('Search Dropdown Options', () => {
    it('should display correct options in header search', () => {
      cy.visit('/')

      // Find the header search input
      cy.get('header input[type="text"]').first().should('be.visible').click()

      // Verify the dropdown options are visible
      cy.get('.multiselect-dropdown:visible')
        .first()
        .within(() => {
          cy.contains('dans les jeux de données').should('be.visible')
          cy.contains('dans les collections thématiques').should('be.visible')
          cy.contains('dans les indicateurs').should('be.visible')
          cy.contains('dans les API').should('be.visible')
        })
    })
  })

  describe('Collections thématiques Cards Display', () => {
    it('should display collection cards in the discover section', () => {
      cy.visit('/')

      cy.contains('h2', 'Collections thématiques').should('be.visible')
      cy.get('.collection-card').should('have.length.greaterThan', 0)
      cy.contains('a', 'Collections thématiques').should('be.visible')
    })

    it('should display the total count of collections', () => {
      cy.mockDatagouvObjectList('topics', topicFactory.many(3))
      cy.visit('/')
      cy.get('.summary-count').should('have.text', '3')
    })

    it('should navigate to collection thématique detail page when clicking on a card', () => {
      cy.visit('/')

      cy.get('.collection-card').contains('a').first().click()
      cy.url().should('include', '/bouquets/')
    })
  })
})
