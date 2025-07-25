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
    cy.get('.test__topic-detail').should('not.be.empty')

    // Check that the custom description is visible
    cy.get('.test_cas-d-usage-description').should('not.be.empty')
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

  it('should link to solutions recommendations', () => {
    // Check that the solutions recommendations are visible
    cy.get('.reco-solution').should('have.length.gt', 1)

    // Click on the first solution recommendation
    cy.get('.reco-solution:first').within(() => {
      cy.get('a.solution-link').click()
    })

    // Check that the solution detail page is loaded
    cy.url().should('include', '/solutions/')
    cy.get('.fr-breadcrumb__list').should('contain.text', 'Solutions')
  })

  it('should display the APIs cards correctly', () => {
    // Check that the data api card is visible
    cy.get('.api-or-dataset-card').should('not.be.empty')
  })
})

describe("Simplifions Cas d'usages Show Page for cas d'usage with datasets and custom descriptions", () => {
  beforeEach(() => {
    // Visit the Simplifions home page before each test
    cy.visit(
      '/cas-d-usages/marches-publics-depot-et-instruction-des-candidatures'
    )
  })

  it("should display the datasets cards for a cas d'usage with datasets", () => {
    // Check that the api cards are visible
    cy.get('.api-or-dataset-card.dataservices-card').should('not.be.empty')
    // Check that the datasets cards are visible
    cy.get('.api-or-dataset-card.datasets-card').should('not.be.empty')
  })

  it('should display the custom descriptions in the dataservices and datasets cards', () => {
    // Check that the dataservices custom description is visible
    cy.get('.api-or-dataset-description').should('not.be.empty')
  })
})
