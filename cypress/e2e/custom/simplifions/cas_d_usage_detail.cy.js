import {
  mockApidatasetRecommandations,
  mockApiOrDatasetUtiles,
  mockApisOrDatasets,
  mockCasUsage,
  mockSolution,
  mockSolutionRecommandation
} from '../../../support/factories/custom/simplifions/simplifions_mocks'

describe("Simplifions Cas d'usages Show Page", () => {
  beforeEach(() => {
    cy.mockDatagouvObjectList('discussions')
    cy.mockGristImages()

    const { gristRecommandation } = mockSolutionRecommandation({
      API_et_datasets_utiles_fournis: [],
      Descriptions_des_API_et_datasets_utiles_fournis: [],
      Ces_logiciels_l_integrent_deja: []
    })
    const { topicCasUsage } = mockCasUsage(
      {
        Recommandations: [gristRecommandation.id]
      },
      {
        slug: 'aides-publiques-entreprises-sourcage',
        name: 'Aides publiques entreprises | Sourçage',
        description: 'Lorem ipsum dolor sit amet'
      }
    )

    cy.visit(`/cas-d-usages/${topicCasUsage.slug}`)
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
    cy.get('.test_cas-d-usage-description').should(
      'contain.text',
      'Lorem ipsum dolor sit amet'
    )
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
    cy.wait('@get_topics_aides-publiques-entreprises-sourcage')
    // Check that the solutions recommendations are visible
    cy.get('.reco-solution').should('have.length', 1)

    // Click on the first solution recommendation
    cy.get('.reco-solution:first').within(() => {
      cy.get('a.solution-link').click()
    })

    // Check that the solution detail page is loaded
    cy.url().should('include', '/solutions/')
    cy.get('.fr-breadcrumb__list').should('contain.text', 'Solutions')
  })

  it('should not display the APIs cards when no APIs or datasets are recommended', () => {
    cy.get('.api-or-dataset-card').should('not.exist')
  })
})

describe("Simplifions Cas d'usages Show Page for cas d'usage with APIs or datasets recommandations", () => {
  beforeEach(() => {
    cy.mockDatagouvObjectList('discussions')
    cy.mockGristImages()

    const { gristRecommandations } = mockApidatasetRecommandations(2)
    const { topicCasUsage } = mockCasUsage(
      {
        Recommandations: gristRecommandations.map((reco) => reco.id)
      },
      {
        slug: 'aides-publiques-entreprises-sourcage',
        name: 'Aides publiques entreprises | Sourçage',
        description: 'Lorem ipsum dolor sit amet'
      }
    )

    cy.visit(`/cas-d-usages/${topicCasUsage.slug}`)
  })

  it('should display the recommandations of APIs or datasets', () => {
    cy.get('.reco-data-api-card').should('have.length', 2)
    cy.get('.api-or-dataset-card').should('have.length', 2)
  })
})

describe("Simplifions Cas d'usages Show Page for cas d'usage with APIs or datasets, and one custom description", () => {
  beforeEach(() => {
    cy.mockDatagouvObjectList('discussions')
    cy.mockGristImages()

    const { gristApisAndDatasets } = mockApisOrDatasets(2)
    const { gristApiOrDatasetUtiles } = mockApiOrDatasetUtiles(
      [gristApisAndDatasets[0].id],
      {
        En_quoi_cette_API_ou_dataset_est_utile_pour_ce_cas_d_usage:
          'This is a custom description'
      }
    )

    const { gristRecommandation } = mockSolutionRecommandation({
      API_et_datasets_utiles_fournis: gristApisAndDatasets.map((a) => a.id),
      Descriptions_des_API_et_datasets_utiles_fournis:
        gristApiOrDatasetUtiles.map((a) => a.id),
      Ces_logiciels_l_integrent_deja: []
    })
    const { topicCasUsage } = mockCasUsage({
      Recommandations: [gristRecommandation.id]
    })

    cy.visit(`/cas-d-usages/${topicCasUsage.slug}`)
  })

  it('should display the dataservices and datasets useful inside the recommandationsolution', () => {
    cy.get('.reco-solution').should(
      'contain.text',
      'API et données utiles fournies par la solution'
    )
    cy.get('.api-or-dataset-utile').should('have.length', 2)
  })

  it('should display the custom description of the api or dataset utile', () => {
    // Check that the dataservices custom description is visible
    cy.get('.api-or-dataset-utile').should('have.length', 2)
    cy.get('.api-or-dataset-utile-description').should('have.length', 1)
    cy.get('.api-or-dataset-utile-description').should(
      'contain.text',
      'This is a custom description'
    )
  })
})

describe("Simplifions Cas d'usages Show page for cas d'usage with editors integrations", () => {
  beforeEach(() => {
    cy.mockDatagouvObjectList('discussions')
    cy.mockGristImages()

    const { gristSolution: gristEditorSolution } = mockSolution({
      Nom: 'The Best Editor Solution'
    })

    const { gristRecommandation } = mockSolutionRecommandation({
      API_et_datasets_utiles_fournis: [],
      Descriptions_des_API_et_datasets_utiles_fournis: [],
      Ces_logiciels_l_integrent_deja: [gristEditorSolution.id]
    })
    const { topicCasUsage } = mockCasUsage({
      Recommandations: [gristRecommandation.id]
    })

    cy.visit(`/cas-d-usages/${topicCasUsage.slug}`)
  })

  it('should display the editor solution', () => {
    cy.get('.solutions-editeurs').should('have.length', 1)
    cy.get('.solutions-editeurs').should(
      'contain.text',
      'The Best Editor Solution'
    )
  })
})
