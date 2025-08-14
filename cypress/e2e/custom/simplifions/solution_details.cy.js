describe('Simplifions Solutions Details Page', () => {
  beforeEach(() => {
    // Visit the Simplifions home page before each test
    cy.visit('/solutions/annuaire-des-entreprises')
  })

  it('should display the solutions details page correctly', () => {
    // Verify the page loads and has the correct title
    cy.get('h1').should('contain.text', 'Annuaire des Entreprises')

    // Check that the topic detail is visible
    cy.get('.test__topic-detail').should('not.be.empty')

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
    // Wait for the topic to load first
    cy.get('.test__topic-detail', { timeout: 10000 }).should('be.visible')

    // Check that there is at least one cas d'usage card
    cy.get('.test__cas-d-usage-card').should('have.length.gt', 1)

    // Click on the first cas d'usage
    cy.get('.test__cas-d-usage-card:first').within(() => {
      cy.get('a.cas-d-usage-link').click()
    })

    // Check that the cas d'usage detail page is loaded
    cy.url().should('include', '/cas-d-usages/')
    cy.get('.fr-breadcrumb__list').should('contain.text', "Cas d'usages")
  })

  describe("Simplifions Cas d'usages Show Page for cas d'usage with APIs", () => {
    beforeEach(() => {
      // Visit the Simplifions home page before each test
      cy.visit('/cas-d-usages/achat-solution')
    })

    it("should display the datasets cards for a cas d'usage with datasets", () => {
      // Check that the api cards are visible
      cy.get('.api-or-dataset-card.dataservices-card').should('not.be.empty')
    })
  })
})
