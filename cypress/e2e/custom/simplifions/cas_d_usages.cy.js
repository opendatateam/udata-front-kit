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

    // Verify that cas d'usages are displayed (assuming they're in some container)
    // This could be cards, list items, or other containers depending on the implementation
    cy.get('body').should('not.be.empty')
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

    // Verify that the number of pages of the pagination is 4
    cy.get('nav.fr-pagination').within(() => {
      cy.get('a.fr-pagination__link.fr-unhidden-lg').should('have.length', 4)
    })
  })

  it("should be able to search for a cas d'usage", () => {
    // Fill the search bar with the topic name
    cy.get('input#search-topic').type('Aides publiques entreprise')

    // Verify that the page has the correct number of results
    cy.get('div.topic-card').should('have.length', 2)
  })

  it('should be able to filter by fournisseurs de service', () => {
    // Select the filter using the custom DSFR multiselect command
    cy.selectFilterValue('À destination de :', 'Communes')

    // Verify that the number of pages of the pagination is now 2
    cy.get('nav.fr-pagination').within(() => {
      cy.get('a.fr-pagination__link.fr-unhidden-lg').should('have.length', 2)
    })
  })
})
