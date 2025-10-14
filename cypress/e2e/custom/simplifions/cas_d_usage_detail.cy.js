import {
  mockApidatasetRecommandations,
  mockApiOrDatasetUtiles,
  mockApisOrDatasets,
  mockCasUsage,
  mockSolution,
  mockSolutionRecommandation
} from '../../../support/factories/custom/simplifions/simplifions_mocks'

import './support'

describe("Simplifions Cas d'usages Show Page", () => {
  beforeEach(() => {
    cy.baseMocksForSimplifions()

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

  it('should not display the access link when no access link is provided', () => {
    cy.get('.reco-solution .access-link').should('not.exist')
  })

  describe('with an access link in recommandation grist data', () => {
    beforeEach(() => {
      const { gristRecommandation } = mockSolutionRecommandation({
        API_et_datasets_utiles_fournis: [],
        Descriptions_des_API_et_datasets_utiles_fournis: [],
        Ces_logiciels_l_integrent_deja: [],
        URL_demande_d_acces_cas_usage: 'https://example.com'
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

    it('should have a functional access link', () => {
      cy.get('.reco-solution .access-link').should(
        'contain.text',
        "Demande d'accès"
      )
    })
  })
})

describe("Simplifions Cas d'usages Show Page for cas d'usage with APIs or datasets recommandations", () => {
  beforeEach(() => {
    cy.baseMocksForSimplifions()

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
    cy.get('.dataset-card').should('have.length', 1)
    cy.get('.dataservice-card').should('have.length', 1)
  })

  it('should not display the access link when no access link is provided', () => {
    cy.get('.reco-data-api-card .access-link').should('not.exist')
  })

  describe('with an access link in recommandation grist data', () => {
    beforeEach(() => {
      const { gristRecommandations } = mockApidatasetRecommandations(1, {
        URL_demande_d_acces_cas_usage: 'https://example.com'
      })
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

    it('should have a functional access link', () => {
      cy.get('.reco-data-api-card .access-link').should(
        'contain.text',
        "Demande d'accès"
      )
    })
  })

  describe('with dataservice authorization_request_url', () => {
    beforeEach(() => {
      cy.baseMocksForSimplifions()

      const { gristRecommandations, dataservicesOrDatasets } =
        mockApidatasetRecommandations(
          1,
          {},
          { Type: 'API' },
          { authorization_request_url: 'https://dataservice-auth.example.com' }
        )

      const { topicCasUsage } = mockCasUsage(
        {
          Recommandations: gristRecommandations.map((reco) => reco.id)
        },
        {
          slug: 'dataservice-auth-test',
          name: 'Test with Dataservice Auth',
          description: 'Testing authorization_request_url'
        }
      )

      cy.visit(`/cas-d-usages/${topicCasUsage.slug}`)
      cy.wait(`@get_dataservices_${dataservicesOrDatasets[0].slug}`)
    })

    it('should display the access link from dataservice authorization_request_url', () => {
      cy.get('.reco-data-api-card .access-link').should('exist')
      cy.get('.reco-data-api-card .access-link')
        .should('contain.text', "Demande d'accès")
        .and('have.attr', 'href', 'https://dataservice-auth.example.com')
    })
  })

  describe('with both access link in recommandation grist data and dataservice authorization_request_url', () => {
    beforeEach(() => {
      cy.baseMocksForSimplifions()

      const { gristRecommandations, dataservicesOrDatasets } =
        mockApidatasetRecommandations(
          1,
          {
            URL_demande_d_acces_cas_usage:
              'https://recommandation-url.example.com'
          },
          { Type: 'API' },
          { authorization_request_url: 'https://dataservice-auth.example.com' }
        )

      const { topicCasUsage } = mockCasUsage(
        {
          Recommandations: gristRecommandations.map((reco) => reco.id)
        },
        {
          slug: 'priority-test',
          name: 'Test URL Priority',
          description: 'Testing URL priority'
        }
      )

      cy.visit(`/cas-d-usages/${topicCasUsage.slug}`)
      cy.wait(`@get_dataservices_${dataservicesOrDatasets[0].slug}`)
    })

    it('should prioritize recommandation URL over dataservice authorization_request_url', () => {
      cy.get('.reco-data-api-card .access-link').should('exist')
      cy.get('.reco-data-api-card .access-link')
        .should('contain.text', "Demande d'accès")
        .and('have.attr', 'href', 'https://recommandation-url.example.com')
    })
  })
})

describe("Simplifions Cas d'usages Show Page for cas d'usage with APIs or datasets, and one custom description", () => {
  beforeEach(() => {
    cy.baseMocksForSimplifions()

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
      'API et données utiles, fournies par la solution'
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
    cy.baseMocksForSimplifions()

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
