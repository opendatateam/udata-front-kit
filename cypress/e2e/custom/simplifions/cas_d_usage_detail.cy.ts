import { apiOrDatasetFactory } from '../../../support/factories/custom/simplifions/grist_factory'
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
        slug: 'aides-publiques-entreprises-sourcage',
        name: 'Aides publiques entreprises | Sourçage',
        description: 'Lorem ipsum dolor sit amet'
      },
      [gristRecommandation]
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
      cy.get(link.attr('href')!).should('be.visible')
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
        access_link_with_fallback: 'https://example.com'
      })

      const { topicCasUsage } = mockCasUsage(
        {
          slug: 'aides-publiques-entreprises-sourcage',
          name: 'Aides publiques entreprises | Sourçage',
          description: 'Lorem ipsum dolor sit amet'
        },
        [gristRecommandation]
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
        slug: 'aides-publiques-entreprises-sourcage',
        name: 'Aides publiques entreprises | Sourçage',
        description: 'Lorem ipsum dolor sit amet'
      },
      gristRecommandations
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
        access_link_with_fallback: 'https://example.com'
      })
      const { topicCasUsage } = mockCasUsage(
        {
          slug: 'aides-publiques-entreprises-sourcage',
          name: 'Aides publiques entreprises | Sourçage',
          description: 'Lorem ipsum dolor sit amet'
        },
        gristRecommandations
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
          slug: 'dataservice-auth-test',
          name: 'Test with Dataservice Auth',
          description: 'Testing authorization_request_url'
        },
        gristRecommandations
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
            access_link_with_fallback: 'https://recommandation-url.example.com'
          },
          { Type: 'API' },
          { authorization_request_url: 'https://dataservice-auth.example.com' }
        )

      const { topicCasUsage } = mockCasUsage(
        {
          slug: 'priority-test',
          name: 'Test URL Priority',
          description: 'Testing URL priority'
        },
        gristRecommandations
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
    const { topicCasUsage } = mockCasUsage({}, [gristRecommandation])

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

describe("Simplifions Cas d'usages Show page for cas d'usage with integrating solutions", () => {
  beforeEach(() => {
    cy.baseMocksForSimplifions()

    const { gristSolution: gristEditorSolution } = mockSolution({
      Nom: 'The Best Editor Solution'
    })

    const { gristRecommandation } = mockSolutionRecommandation({
      API_et_datasets_utiles_fournis: [],
      Descriptions_des_API_et_datasets_utiles_fournis: [],
      Ces_logiciels_l_integrent_deja: [],
      Solutions_integratrices_categorie_logiciel_metier: [
        gristEditorSolution.id
      ]
    })
    const { topicCasUsage } = mockCasUsage({}, [gristRecommandation])

    cy.visit(`/cas-d-usages/${topicCasUsage.slug}`)
  })

  it('should display the integrating solution', () => {
    cy.get('.solution-integratrice-card').should('have.length', 1)
    cy.get('.solution-integratrice-card').should(
      'contain.text',
      'The Best Editor Solution'
    )
  })
})

describe("Simplifions Cas d'usages Show page - integration score on solution cards", () => {
  // Creates 3 API records, mocks the APIs_et_datasets table, and returns their IDs.
  // The component fetches these records to render the "API et données utiles" accordion.
  const mockUsefulApis = () => {
    const gristApis = apiOrDatasetFactory.many(3)
    cy.mockGristRecords('APIs_et_datasets', gristApis)
    return gristApis.map((a) => a.id)
  }

  const setup = (recommandationOverrides = {}) => {
    cy.baseMocksForSimplifions()
    const usefulApiIds = mockUsefulApis()

    // Integrating solution: integrates 2 of the 3 useful APIs, plus 1 unrelated
    const { gristSolution: gristIntegrateur } = mockSolution({
      Nom: 'Solution Intégratrice',
      Visible_sur_simplifions: true,
      API_ou_datasets_integres: [usefulApiIds[0], usefulApiIds[1], 99999],
      liste_categories_de_solution: ['Logiciel métier'],
      Type_de_solution: ['Logiciel métier']
    })

    const { gristRecommandation } = mockSolutionRecommandation({
      API_et_datasets_utiles_fournis: usefulApiIds,
      Descriptions_des_API_et_datasets_utiles_fournis: [],
      Ces_logiciels_l_integrent_deja: [],
      Solutions_integratrices_categorie_logiciel_metier: [gristIntegrateur.id],
      ...recommandationOverrides
    })

    const { topicCasUsage } = mockCasUsage({}, [gristRecommandation])
    cy.visit(`/cas-d-usages/${topicCasUsage.slug}`)
  }

  it('should display the X/Y integration score on the card', () => {
    setup()
    cy.get('.integration-indicator').should('exist')
    cy.get('.integration-indicator__count').should('contain.text', '2/3')
  })

  it('should not display a score when the recommandation has no useful APIs', () => {
    cy.baseMocksForSimplifions()

    const { gristSolution: gristIntegrateur } = mockSolution({
      Nom: 'Solution Sans Score',
      Visible_sur_simplifions: true,
      API_ou_datasets_integres: [101, 102],
      liste_categories_de_solution: ['Logiciel métier']
    })

    const { gristRecommandation } = mockSolutionRecommandation({
      API_et_datasets_utiles_fournis: [],
      Descriptions_des_API_et_datasets_utiles_fournis: [],
      Ces_logiciels_l_integrent_deja: [],
      Solutions_integratrices_categorie_logiciel_metier: [gristIntegrateur.id]
    })

    const { topicCasUsage } = mockCasUsage({}, [gristRecommandation])
    cy.visit(`/cas-d-usages/${topicCasUsage.slug}`)

    cy.get('.integration-indicator').should('not.exist')
  })

  it('should use "API" label when Type_de_recommandation is API', () => {
    setup({ Type_de_recommandation: 'API' })
    cy.get('.integration-indicator__label').should('contain.text', 'API')
    cy.get('.integration-indicator__label').should(
      'not.contain.text',
      'jeu de données'
    )
  })

  it('should use "jeu de données" label when Type_de_recommandation is Jeu de données', () => {
    setup({ Type_de_recommandation: 'Jeu de données' })
    cy.get('.integration-indicator__label').should(
      'contain.text',
      'jeu de données'
    )
  })

  it('should fall back to "API ou jeu de données" label when Type_de_recommandation is null', () => {
    setup({ Type_de_recommandation: null })
    cy.get('.integration-indicator__label').should(
      'contain.text',
      'API ou jeu de données'
    )
  })
})
