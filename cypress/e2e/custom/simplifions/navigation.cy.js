import {
  topicCasUsageFactory,
  topicSolutionFactory
} from '../../../support/factories/custom/simplifions/topics_factory'
import './support'

describe('Simplifions Navigation', () => {
  beforeEach(() => {
    cy.baseMocksForSimplifions()
    cy.visit('/')
  })

  it('should display all navigation menu items', () => {
    // Check that the main navigation menu exists
    cy.get('header[role="banner"]').should('exist').and('be.visible')

    // Verify all expected navigation items are present
    cy.get('header[role="banner"]').within(() => {
      cy.contains('a', 'Accueil').should('be.visible')
      cy.contains('a', "Cas d'usages").should('be.visible')
      cy.contains('a', 'Solutions').should('be.visible')
      cy.contains('a', 'À propos').should('be.visible')
    })
  })

  it('should navigate to "Cas d\'usages" page and display correctly', () => {
    // Click on "Cas d'usages" in the navigation
    cy.get('nav').contains('a', "Cas d'usages").click()

    // Check that the page loads correctly
    cy.get('body').should('be.visible')

    // Verify page title/heading contains "Cas d'usages"
    cy.get('h1').should('contain.text', "Cas d'usages")
  })

  it('should navigate to "Solutions" page and display correctly', () => {
    // Click on "Solutions" in the navigation
    cy.get('nav').contains('a', 'Solutions').click()

    // Check that the page loads correctly
    cy.get('body').should('be.visible')

    // Verify page title/heading contains "Solutions"
    cy.get('h1').should('contain.text', 'Solutions')
  })

  it('should navigate to "À propos" page and display correctly', () => {
    // Click on "À propos" in the navigation
    cy.get('nav').contains('a', 'À propos').click()

    // Check that the page loads correctly
    cy.get('body').should('be.visible')

    // Verify page title/heading contains "À propos"
    cy.get('h1').should('contain.text', 'À propos')
  })

  it("should search for cas d'usages", () => {
    cy.mockDatagouvObjectList('topics', topicCasUsageFactory.many(2))

    cy.get('header[role="banner"]').within(() => {
      // Click on the search input
      cy.get('input.multiselect-search:first').click()

      // Type "annuaire" into the search input
      cy.get('input.multiselect-search:first').type('entreprises')

      // Click on the search button
      cy.contains(
        'button',
        "Rechercher « entreprises » dans les cas d'usage"
      ).click()
    })

    // Wait for the page to load and check that the search results are visible
    cy.get('h1').should('contain.text', "Cas d'usages")
    cy.get('.topic-card').should('have.length', 2)
  })

  it('should search for solutions', () => {
    cy.mockDatagouvObjectList('topics', topicSolutionFactory.many(2))
    cy.get('header[role="banner"]').within(() => {
      // Click on the search input
      cy.get('input.multiselect-search:first').click()

      // Type "annuaire" into the search input
      cy.get('input.multiselect-search:first').type('annuaire')

      // Click on the search button
      cy.contains(
        'button',
        'Rechercher « annuaire » dans les solutions'
      ).click()
    })

    // Wait for the page to load and check that the search results are visible
    cy.get('h1').should('contain.text', 'Solutions')
    cy.get('.topic-card').should('have.length', 2)
  })
})
