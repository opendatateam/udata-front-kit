import { apiOrDatasetFactory } from '../../../support/factories/custom/simplifions/grist_factory'
import type { ApiOrDatasetRecord } from '@/custom/simplifions/model/grist'
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
    cy.get('.reco-card').should('have.length', 1)

    // Click on the first solution recommendation
    cy.get('.reco-card:first').within(() => {
      cy.get('.fr-accordion__btn').first().click()
      cy.get('a.test__solution-link').click()
    })

    // Check that the solution detail page is loaded
    cy.url().should('include', '/solutions/')
    cy.get('.fr-breadcrumb__list').should('contain.text', 'Solutions')
  })

  it('should not display the APIs cards when no APIs or datasets are recommended', () => {
    cy.get('.api-or-dataset-card').should('not.exist')
  })

  it('should not display the access link when no access link is provided', () => {
    cy.get('.reco-card .test__access-link').should('not.exist')
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
      cy.get('.reco-card .test__access-link').should(
        'contain.text',
        'Demander un accès'
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
    cy.get('.reco-card').should('have.length', 2)
    cy.get('.api-or-dataset-card').should('have.length', 2)
    cy.get('.dataset-card').should('have.length', 1)
    cy.get('.dataservice-card').should('have.length', 1)
  })

  it('should not display the access link when no access link is provided', () => {
    cy.get('.reco-card .test__access-link').should('not.exist')
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
      cy.get('.reco-card .test__access-link').should(
        'contain.text',
        'Demander un accès'
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
      cy.get('.reco-card .test__access-link').should('exist')
      cy.get('.reco-card .test__access-link')
        .should('contain.text', 'Demander un accès')
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
      cy.get('.reco-card .test__access-link').should('exist')
      cy.get('.reco-card .test__access-link')
        .should('contain.text', 'Demander un accès')
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

  it('should display the dataservices and datasets useful inside the recommandation', () => {
    cy.get('.reco-card').should(
      'contain.text',
      "Endpoints de l'API utiles pour ce cas d'usage"
    )
    cy.get('.test__api-or-dataset-utile').should('have.length', 2)
  })

  it('should display the custom description of the api or dataset utile', () => {
    // Check that the dataservices custom description is visible
    cy.get('.test__api-or-dataset-utile').should('have.length', 2)
    cy.get('.test__api-or-dataset-utile-description').should('have.length', 1)
    cy.get('.test__api-or-dataset-utile-description').should(
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

describe("Simplifions Cas d'usages Show page - useful endpoints table filtering and pagination", () => {
  // Creates the recommandation's useful endpoints table and opens the
  // direct-access accordion where it lives.
  const setupWithEndpoints = (gristApis: ApiOrDatasetRecord[]) => {
    cy.baseMocksForSimplifions()
    cy.mockGristRecords('APIs_et_datasets', gristApis)
    gristApis.forEach((api) => cy.mockGristRecord('APIs_et_datasets', api))

    const { gristRecommandation } = mockSolutionRecommandation({
      API_et_datasets_utiles_fournis: gristApis.map((a) => a.id),
      Descriptions_des_API_et_datasets_utiles_fournis: [],
      Ces_logiciels_l_integrent_deja: []
    })
    const { topicCasUsage } = mockCasUsage({}, [gristRecommandation])
    cy.visit(`/cas-d-usages/${topicCasUsage.slug}`)

    cy.get('.fr-accordion__btn').first().click()
  }

  describe('filtering', () => {
    beforeEach(() => {
      const gristApis = [
        apiOrDatasetFactory.one({
          overrides: { fields: { Nom: 'Guichet unique des entreprises' } }
        }),
        ...apiOrDatasetFactory.many(3)
      ]
      setupWithEndpoints(gristApis)
    })

    it('should filter endpoints matching the search query', () => {
      cy.get('.test__api-or-dataset-utile').should('have.length', 4)

      cy.get('input[type="search"]').type('Guichet unique')

      cy.get('.test__api-or-dataset-utile').should('have.length', 1)
      cy.get('.test__api-or-dataset-utile').should(
        'contain.text',
        'Guichet unique des entreprises'
      )
    })

    it('should display a message when no endpoint matches the search query', () => {
      cy.get('input[type="search"]').type('does not exist at all')

      cy.get('.test__api-or-dataset-utile').should('not.exist')
      cy.contains('Aucun endpoint ne correspond à votre recherche.').should(
        'be.visible'
      )
    })

    it('should display all endpoints again once the search query is cleared', () => {
      cy.get('input[type="search"]').type('Guichet unique')
      cy.get('.test__api-or-dataset-utile').should('have.length', 1)

      cy.get('input[type="search"]').clear()
      cy.get('.test__api-or-dataset-utile').should('have.length', 4)
    })
  })

  describe('pagination', () => {
    beforeEach(() => {
      setupWithEndpoints(apiOrDatasetFactory.many(6))
    })

    it('should split endpoints across several pages', () => {
      cy.get('.fr-table__footer').should('be.visible')
      cy.get('a.fr-pagination__link.fr-unhidden-lg').should('have.length', 2)
      cy.get('.test__api-or-dataset-utile').should('have.length', 4)
    })

    it('should display different endpoints on the next page', () => {
      cy.get('.test__api-or-dataset-utile b').then(($rows) => {
        const firstPageNames = [...$rows].map((el) => el.textContent)

        cy.get('.fr-pagination__link--next').click()

        cy.get('.test__api-or-dataset-utile b').should(($newRows) => {
          const secondPageNames = [...$newRows].map((el) => el.textContent)
          expect(secondPageNames).to.not.deep.equal(firstPageNames)
          firstPageNames.forEach((name) => {
            expect(secondPageNames).to.not.include(name)
          })
        })
      })
    })

    it('should reset to the first page when the endpoints are re-filtered', () => {
      cy.get('.fr-pagination__link--next').click()
      cy.get('.fr-pagination__link[aria-current="page"]').should(
        'not.contain.text',
        '1'
      )

      // Every generated endpoint name contains "n°", so this keeps the full
      // list (and thus pagination) while still re-triggering the filter watcher.
      cy.get('input[type="search"]').type('n°')

      cy.get('.fr-pagination__link[aria-current="page"]').should(
        'contain.text',
        '1'
      )
    })
  })
})

describe("Simplifions Cas d'usages Show page - accordions behaviour", () => {
  // Creates a solution recommandation with two real (clickable) accordions:
  // the direct-access one (API/database) and the "logiciel métier" one.
  const setupWithTwoAccordions = (recommandationOverrides = {}) => {
    cy.baseMocksForSimplifions()

    const { gristSolution: gristIntegrateur } = mockSolution({
      Nom: 'Solution Intégratrice',
      Visible_sur_simplifions: true,
      liste_categories_de_solution: ['Logiciel métier']
    })

    const { gristRecommandation } = mockSolutionRecommandation({
      API_et_datasets_utiles_fournis: [],
      Descriptions_des_API_et_datasets_utiles_fournis: [],
      Ces_logiciels_l_integrent_deja: [],
      Solutions_integratrices_categorie_logiciel_metier: [gristIntegrateur.id],
      ...recommandationOverrides
    })

    const { topicCasUsage } = mockCasUsage({}, [gristRecommandation])
    cy.visit(`/cas-d-usages/${topicCasUsage.slug}`)
  }

  it('should title the direct-access accordion "Par l\'API directement" when Type_de_recommandation is API', () => {
    setupWithTwoAccordions({ Type_de_recommandation: 'API' })
    cy.get('button.fr-accordion__btn')
      .eq(0)
      .should('contain.text', "Par l'API directement")
  })

  it('should title the direct-access accordion "Par la base de données directement" when Type_de_recommandation is Jeu de données', () => {
    setupWithTwoAccordions({ Type_de_recommandation: 'Jeu de données' })
    cy.get('button.fr-accordion__btn')
      .eq(0)
      .should('contain.text', 'Par la base de données directement')
  })

  it('should fall back to "Par la base de données ou l\'API directement" for the accordion title when Type_de_recommandation is null', () => {
    setupWithTwoAccordions({ Type_de_recommandation: null })
    cy.get('button.fr-accordion__btn')
      .eq(0)
      .should('contain.text', "Par la base de données ou l'API directement")
  })

  it('should collapse the previously open accordion when another one is opened', () => {
    setupWithTwoAccordions()

    cy.get('button.fr-accordion__btn').eq(0).click()
    cy.get('button.fr-accordion__btn')
      .eq(0)
      .should('have.attr', 'aria-expanded', 'true')

    cy.get('button.fr-accordion__btn').eq(1).click()
    cy.get('button.fr-accordion__btn')
      .eq(1)
      .should('have.attr', 'aria-expanded', 'true')
    cy.get('button.fr-accordion__btn')
      .eq(0)
      .should('have.attr', 'aria-expanded', 'false')
  })

  it('should render empty integrating-solutions categories as non-interactive placeholders', () => {
    cy.baseMocksForSimplifions()

    const { gristRecommandation } = mockSolutionRecommandation({
      API_et_datasets_utiles_fournis: [],
      Descriptions_des_API_et_datasets_utiles_fournis: [],
      Ces_logiciels_l_integrent_deja: []
    })
    const { topicCasUsage } = mockCasUsage({}, [gristRecommandation])
    cy.visit(`/cas-d-usages/${topicCasUsage.slug}`)

    // The 3 "solutions intégratrices" categories have no solution by default
    cy.get('.fr-accordion__btn--empty').should('have.length', 3)
    cy.get('.fr-accordion__btn--empty').each(($el) => {
      expect($el.prop('tagName')).to.eq('SPAN')
      expect($el.attr('aria-expanded')).to.eq(undefined)
    })
  })

  it("should not affect another reco-card's accordion when one is opened", () => {
    cy.baseMocksForSimplifions()

    const { gristRecommandations } = mockApidatasetRecommandations(2)
    const { topicCasUsage } = mockCasUsage({}, gristRecommandations)
    cy.visit(`/cas-d-usages/${topicCasUsage.slug}`)

    cy.get('.reco-card').eq(0).find('button.fr-accordion__btn').click()

    cy.get('.reco-card')
      .eq(0)
      .find('button.fr-accordion__btn')
      .should('have.attr', 'aria-expanded', 'true')
    cy.get('.reco-card')
      .eq(1)
      .find('button.fr-accordion__btn')
      .should('have.attr', 'aria-expanded', 'false')
  })
})
