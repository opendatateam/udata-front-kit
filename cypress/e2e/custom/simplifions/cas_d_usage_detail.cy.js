describe("Simplifions Cas d'usages Show Page", () => {
  beforeEach(() => {
    // Visit the Simplifions home page before each test
    cy.visit('/cas-d-usages/aides-publiques-entreprises-sourcage')
  })

  it("should display the cas d'usage show page correctly", () => {
    // Verify the page loads and has the correct title
    cy.get('h1').should(
      'contain.text',
      'Aides publiques entreprises | Sourçage'
    )

    // Check that the topic detail is visible
    cy.get('.topic-detail').should('not.be.empty')

    // Check that the custom description is visible
    cy.get('.cas-usage-description').should('not.be.empty')
  })
})
