describe("Simplifions Cas d'usages Page", () => {
  beforeEach(() => {
    // Visit the Simplifions home page before each test
    cy.visit('/cas-d-usages')
  })

  it("should display the cas d'usages listing page correctly", () => {
    // Verify the page loads and has the correct title
    cy.get('h1').should('contain.text', "Cas d'usages")

    // Check that the page body is visible
    cy.get('body').should('be.visible')

    // Verify that the list is not empty
    cy.get('ul[role="list"]').should('not.be.empty')
  })

  it("should display a paginated list of cas d'usages", () => {
    // Verify that the page has 10 results
    cy.get('div.topic-card').should('have.length', 10)

    // Verify that the page has a pagination component
    cy.get('nav.fr-pagination').should('be.visible')

    // Check that the pagination component has several pages
    cy.get('nav.fr-pagination').within(() => {
      cy.get('a.fr-pagination__link.fr-unhidden-lg').should('have.length.gt', 1)
    })
  })

  it("should be able to search for a cas d'usage", () => {
    // Fill the search bar with the topic name
    cy.get('input#search-topic').type('Aides publiques entreprise')

    // Verify that the page has the correct number of results
    cy.get('#number-of-results').should(
      'contain.text',
      "2 cas d'usages disponibles"
    )
  })

  it('should be able to filter by fournisseurs de service', () => {
    // Store the initial number of results
    cy.get('#number-of-results')
      .invoke('text')
      .then((text) => parseInt(text.replace(" cas d'usages disponibles", '')))
      .as('initialCount')

    // Apply the filter
    cy.selectFilterValue('À destination de :', 'Communes')

    // Wait for the results to change
    cy.get('@initialCount').then((initialCount) => {
      cy.get('#number-of-results').should(
        'not.contain.text',
        `${initialCount} cas d'usages disponibles`
      )
    })

    // Verify the count decreased by comparing with the stored alias
    cy.get('@initialCount').then((initialCount) => {
      cy.get('#number-of-results')
        .invoke('text')
        .then((text) => parseInt(text.replace(" cas d'usages disponibles", '')))
        .should('be.lessThan', initialCount)
    })
  })
})
