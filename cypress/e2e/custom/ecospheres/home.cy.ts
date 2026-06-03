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

  it('should not display header search on homepage', () => {
    cy.visit('/')
    cy.get('header .fr-search-bar').should('not.exist')
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
