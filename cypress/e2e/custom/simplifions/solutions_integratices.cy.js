import {
  mockSolution,
  mockSolutionsIntegratices
} from '../../../support/factories/custom/simplifions/simplifions_mocks'

import './support'

describe('Solutions intégratrices block', () => {
  const setupWithIntegrateurs = ({
    integrateursSolutionFields = [],
    casUsageFields = [],
    integrations = [],
    recommandations = []
  } = {}) => {
    cy.baseMocksForSimplifions()

    const { gristIntegrateurs } = mockSolutionsIntegratices({
      fournisseurSolutionId: 999,
      integrateursSolutionFields,
      casUsageFields,
      integrations,
      recommandations
    })

    const { gristSolution, topicSolution } = mockSolution({
      API_ou_datasets_integres: [],
      APIs_ou_datasets_fournis: [],
      Recommande_pour_les_cas_d_usages: [],
      solutions_integratrices: gristIntegrateurs.map((s) => s.id)
    })

    // Register specific intercept for integrator IDs after the general one
    cy.mockGristRecordsByIds('Solutions', gristIntegrateurs)

    cy.visit(`/solutions/${topicSolution.slug}`)
    return { gristSolution, topicSolution }
  }

  it('should not display the block when there are no integrators', () => {
    cy.baseMocksForSimplifions()

    const { topicSolution } = mockSolution({
      API_ou_datasets_integres: [],
      APIs_ou_datasets_fournis: [],
      Recommande_pour_les_cas_d_usages: [],
      solutions_integratrices: null
    })

    cy.visit(`/solutions/${topicSolution.slug}`)
    cy.get('#solutions-integratices').should('not.exist')
  })

  it('should display the block with integrator cards', () => {
    setupWithIntegrateurs({
      integrateursSolutionFields: [
        { Nom: 'Intégrateur A', Visible_sur_simplifions: true },
        { Nom: 'Intégrateur B', Visible_sur_simplifions: true }
      ]
    })

    cy.get('#solutions-integratices').should('be.visible')
    cy.get('.integrateur-card').should('have.length', 2)
    cy.get('.integrateur-card').first().should('contain.text', 'Intégrateur A')
  })

  it('should not show filters when there is only one integrator', () => {
    setupWithIntegrateurs({
      integrateursSolutionFields: [
        { Nom: 'Seul Intégrateur', Visible_sur_simplifions: true }
      ]
    })

    cy.get('#solutions-integratices').should('be.visible')
    cy.get('.integrateur-card').should('have.length', 1)
    cy.get('.integrateurs-filters').should('not.exist')
  })

  it('should show filters when there are multiple integrators', () => {
    setupWithIntegrateurs({
      integrateursSolutionFields: [
        { Nom: 'Intégrateur A', Visible_sur_simplifions: true },
        { Nom: 'Intégrateur B', Visible_sur_simplifions: true }
      ]
    })

    cy.get('.integrateurs-filters').should('be.visible')
    cy.get('#type-solutions').should('exist')
    cy.get('#cas-usage').should('exist')
    cy.get('#min-apis').should('exist')
  })

  it('should filter by type de solution', () => {
    setupWithIntegrateurs({
      integrateursSolutionFields: [
        {
          Nom: 'Éditeur Solution',
          Type_de_solution: ['Éditeur'],
          Visible_sur_simplifions: true
        },
        {
          Nom: 'Portail Solution',
          Type_de_solution: ['Portail'],
          Visible_sur_simplifions: true
        }
      ]
    })

    cy.get('#type-solutions').select('Éditeur')
    cy.get('.integrateur-card').should('have.length', 1)
    cy.get('.integrateur-card').should('contain.text', 'Éditeur Solution')
  })

  it('should filter by min APIs integrated', () => {
    setupWithIntegrateurs({
      integrateursSolutionFields: [
        {
          Nom: 'Beaucoup APIs',
          API_ou_datasets_integres: [1, 2, 3],
          Visible_sur_simplifions: true
        },
        {
          Nom: 'Peu APIs',
          API_ou_datasets_integres: [1],
          Visible_sur_simplifions: true
        }
      ]
    })

    cy.get('#min-apis').select('Au moins 2')
    cy.get('.integrateur-card').should('have.length', 1)
    cy.get('.integrateur-card').should('contain.text', 'Beaucoup APIs')
  })

  it('should sort by integration count by default', () => {
    setupWithIntegrateurs({
      integrateursSolutionFields: [
        {
          Nom: 'Peu APIs',
          API_ou_datasets_integres: [1],
          Visible_sur_simplifions: true
        },
        {
          Nom: 'Beaucoup APIs',
          API_ou_datasets_integres: [1, 2, 3],
          Visible_sur_simplifions: true
        }
      ]
    })

    // "Beaucoup APIs" should be first (most integrations)
    cy.get('.integrateur-card').first().should('contain.text', 'Beaucoup APIs')
  })

  it('should hide integrators not visible on simplifions', () => {
    setupWithIntegrateurs({
      integrateursSolutionFields: [
        { Nom: 'Visible', Visible_sur_simplifions: true },
        { Nom: 'Hidden', Visible_sur_simplifions: false }
      ]
    })

    cy.get('.integrateur-card').should('have.length', 1)
    cy.get('.integrateur-card').should('contain.text', 'Visible')
  })
})
