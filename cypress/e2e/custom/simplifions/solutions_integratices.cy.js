import {
  mockSolution,
  mockSolutionsIntegratices
} from '../../../support/factories/custom/simplifions/simplifions_mocks'
import { topicSolutionFactory } from '../../../support/factories/custom/simplifions/topics_factory'

import './support'

describe('Solutions intégratrices block', () => {
  const setupWithIntegrateurs = ({
    integrateursSolutionFields = [],
    casUsageFields = [],
    integrations = [],
    recommandations = []
  } = {}) => {
    cy.baseMocksForSimplifions()

    const { gristIntegrateurs, gristCasUsages } = mockSolutionsIntegratices({
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
    return { gristSolution, topicSolution, gristIntegrateurs, gristCasUsages }
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

  it("should display X/Y integration ratio per cas d'usage", () => {
    cy.baseMocksForSimplifions()

    // Known IDs for wiring everything together
    const casUsageId = 50
    const integrateurId = 60
    const fournisseurId = 999
    const usefulApis = [101, 102, 103]

    // Mock cas d'usage
    cy.mockGristRecords('Cas_d_usages', [
      {
        id: casUsageId,
        fields: {
          Nom: 'Marchés publics',
          Nom_complet: 'Marchés publics',
          Visible_sur_simplifions: true
        }
      }
    ])

    // Mock recommandation: Y = 3 useful APIs for this cas d'usage
    cy.mockGristRecords('Recommandations', [
      {
        id: 1,
        fields: {
          Cas_d_usage: casUsageId,
          API_et_datasets_utiles_fournis: usefulApis,
          Solution_recommandee: fournisseurId
        }
      }
    ])

    // Mock integrations: X = 2 APIs integrated for this cas d'usage
    cy.mockGristRecords('API_et_datasets_integres', [
      {
        id: 1,
        fields: {
          Solution_integratrice: integrateurId,
          API_ou_dataset_integre: 101,
          Integre_pour_les_cas_d_usages: [casUsageId],
          Solution_fournisseur: fournisseurId
        }
      },
      {
        id: 2,
        fields: {
          Solution_integratrice: integrateurId,
          API_ou_dataset_integre: 102,
          Integre_pour_les_cas_d_usages: [casUsageId],
          Solution_fournisseur: fournisseurId
        }
      }
    ])

    // Mock integrator solution
    const integrateur = {
      id: integrateurId,
      fields: {
        Nom: 'Mon Intégrateur',
        Visible_sur_simplifions: true,
        Type_de_solution: ['Éditeur'],
        API_ou_datasets_integres: [101, 102],
        Public_ou_prive: 'Privé'
      }
    }

    // Mock supplier solution + topic
    const { topicSolution } = mockSolution({
      API_ou_datasets_integres: [],
      APIs_ou_datasets_fournis: [],
      Recommande_pour_les_cas_d_usages: [],
      solutions_integratrices: [integrateurId]
    })

    // Register integrator-specific intercept after the general one
    cy.mockGristRecordsByIds('Solutions', [integrateur])

    // Mock topic for integrator card
    const tagWithId = `simplifions-v2-solutions-${integrateurId}`
    const integrateurTopic = topicSolutionFactory.one({
      overrides: {
        tags: ['simplifions-v2', 'simplifions-v2-solutions', tagWithId]
      }
    })
    cy.mockDatagouvObjectListWithTags('topics', [tagWithId], [integrateurTopic])

    cy.visit(`/solutions/${topicSolution.slug}`)

    cy.get('.cas-usage-card').should('have.length', 1)
    cy.get('.cas-usage-card').should('contain.text', 'Marchés publics')
    cy.get('.cas-usage-card .indicator-count').should('contain.text', '2/3')
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
