import {
  mockApisOrDatasets,
  mockCasUsage,
  mockSolution
} from '../../../support/factories/custom/simplifions/simplifions_mocks'

import './support'

describe('Simplifions Solutions Details Page', () => {
  beforeEach(() => {
    cy.baseMocksForSimplifions()

    const { topicSolution } = mockSolution(
      {
        API_ou_datasets_integres: [],
        APIs_ou_datasets_fournis: [],
        Recommande_pour_les_cas_d_usages: []
      },
      {
        name: 'Annuaire des Entreprises',
        slug: 'annuaire-des-entreprises',
        description: 'Lorem ipsum dolor sit amet'
      }
    )

    cy.visit(`/solutions/${topicSolution.slug}`)
  })

  it('should display the solutions details page correctly', () => {
    // Verify the page loads and has the correct title
    cy.get('h1').should('contain.text', 'Annuaire des Entreprises')

    // Check that the topic detail is visible
    cy.get('.test__topic-detail').should('exist')

    // Check that the custom description is visible
    cy.get('.solution-description').should('exist')
    cy.get('.solution-description').should(
      'contain.text',
      'Lorem ipsum dolor sit amet'
    )
  })

  it('should have a functional summary', () => {
    // Check that the summary is visible
    cy.get('.fr-summary').should('exist')

    // Check that the summary has links
    cy.get('.fr-summary__link').should('have.length.gt', 0)

    // Check that the summary links scroll to the correct anchor
    cy.get('.fr-summary__link').each((link) => {
      cy.wrap(link).click()
      cy.get(link.attr('href')).should('be.visible')
    })
  })

  it('should have a functional site link', () => {
    cy.get('.solution-links .fr-btn').should('have.length', 1)

    cy.get('.solution-links .fr-btn:first').should(
      'contain.text',
      'Site de la solution'
    )
  })

  describe('with an access link in grist data', () => {
    beforeEach(() => {
      const { topicSolution } = mockSolution({
        API_ou_datasets_integres: [],
        APIs_ou_datasets_fournis: [],
        Recommande_pour_les_cas_d_usages: [],
        URL_demande_d_acces: 'https://example.com'
      })

      cy.visit(`/solutions/${topicSolution.slug}`)
    })

    it('should have a functional access link', () => {
      cy.get('.solution-links .fr-btn').should('have.length', 2)
      cy.get('.solution-links .fr-btn:first').should(
        'contain.text',
        'Site de la solution'
      )
      cy.get('.solution-links .fr-btn:last').should(
        'contain.text',
        "Demande d'accès"
      )
    })
  })
})

describe("Simplifions Solutions Details Page with cas d'usages", () => {
  beforeEach(() => {
    cy.baseMocksForSimplifions()

    const { gristCasUsage } = mockCasUsage()

    const { topicSolution } = mockSolution({
      API_ou_datasets_integres: [],
      APIs_ou_datasets_fournis: [],
      Recommande_pour_les_cas_d_usages: [gristCasUsage.id]
    })

    cy.visit(`/solutions/${topicSolution.slug}`)
  })

  it("should link to cas d'usages", () => {
    // Wait for the topic to load first
    cy.get('.test__topic-detail', { timeout: 10000 }).should('be.visible')

    // Check that there is at least one cas d'usage card
    cy.get('.test__cas-d-usage-related-card').should('have.length', 1)

    // Click on the first cas d'usage
    cy.get('.test__cas-d-usage-related-card:first').within(() => {
      cy.get('a.cas-d-usage-link').click()
    })

    // Check that the cas d'usage detail page is loaded
    cy.url().should('include', '/cas-d-usages/')
    cy.get('.fr-breadcrumb__list').should('contain.text', "Cas d'usages")
  })
})

describe("Simplifions Cas d'usages Show Page for cas d'usage with APIs utilisées", () => {
  beforeEach(() => {
    cy.baseMocksForSimplifions()

    const { gristApisAndDatasets } = mockApisOrDatasets(2)

    const { topicSolution } = mockSolution({
      API_ou_datasets_integres: gristApisAndDatasets.map((api) => api.id),
      APIs_ou_datasets_fournis: [],
      Recommande_pour_les_cas_d_usages: []
    })

    cy.visit(`/solutions/${topicSolution.slug}`)
  })

  it("should display the datasets cards for a cas d'usage with datasets", () => {
    // Check that the api cards are visible
    cy.get('#donnees-api-utilisees .api-or-dataset-card').should(
      'have.length',
      2
    )
  })
})

describe("Simplifions Cas d'usages Show Page for cas d'usage with APIs fournies", () => {
  beforeEach(() => {
    cy.baseMocksForSimplifions()

    const { gristApisAndDatasets } = mockApisOrDatasets(2)

    const { topicSolution } = mockSolution({
      // also shows some API_ou_datasets_integres, check we display both
      API_ou_datasets_integres: gristApisAndDatasets.map((api) => api.id),
      APIs_ou_datasets_fournis: gristApisAndDatasets.map((api) => api.id),
      Recommande_pour_les_cas_d_usages: []
    })

    cy.visit(`/solutions/${topicSolution.slug}`)
  })

  it("should display the datasets cards for a cas d'usage with datasets", () => {
    // Check that the api cards are visible
    cy.get('#donnees-api-fournies .api-or-dataset-card').should(
      'have.length',
      2
    )
  })
})
