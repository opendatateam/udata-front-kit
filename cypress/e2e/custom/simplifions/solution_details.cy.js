describe('Simplifions Solutions Details Page', () => {
  beforeEach(() => {
    // Visit the Simplifions home page before each test
    cy.visit('/solutions/annuaire-des-entreprises')
  })

  it('should display the solutions details page correctly', () => {
    // Verify the page loads and has the correct title
    cy.get('h1').should('contain.text', 'Annuaire des entreprises')

    // Check that the topic detail is visible
    cy.get('.topic-detail').should('not.be.empty')

    // Check that the custom description is visible
    cy.get('.solution-description').should('not.be.empty')
  })

  it('should have a functional summary', () => {
    // Check that the summary is visible
    cy.get('.fr-summary').should('not.be.empty')

    // Check that the summary has links
    cy.get('.fr-summary__link').should('have.length.gt', 0)

    // Check that the summary links scroll to the correct anchor
    cy.get('.fr-summary__link').each((link) => {
      cy.wrap(link).click()
      cy.get(link.attr('href')).should('be.visible')
    })
  })

  it("should link to cas d'usages", () => {
    // Check that the cas d'usages are visible
    cy.get('.cas-d-usage-card').should('have.length.gt', 1)

    // Click on the first cas d'usage
    cy.get('.cas-d-usage-card:first').within(() => {
      cy.get('a.cas-d-usage-link').click()
    })

    // Check that the cas d'usage detail page is loaded
    cy.url().should('include', '/cas-d-usages/')
    cy.get('.fr-breadcrumb__list').should('contain.text', "Cas d'usages")
  })
})
