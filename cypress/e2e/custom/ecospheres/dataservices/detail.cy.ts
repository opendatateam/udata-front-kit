import type { Dataservice, DatasetV2 } from '@datagouv/components-next'
import { dataserviceFactory } from '../../../../support/factories/dataservices_factory'
import { datasetFactory } from '../../../../support/factories/datasets_factory'
import { createIndicator } from '../indicators/support'

/**
 * Helper to create a dataservice with all necessary mocks
 */
function createMockedDataservice(
  overrides: Partial<Dataservice> = {},
  datasets: DatasetV2[] = []
): Dataservice {
  const dataservice = dataserviceFactory.one({ overrides })

  // Mock the dataservice itself
  cy.mockDatagouvObject('dataservices', dataservice.id, dataservice)

  // Mock the datasets for this dataservice
  cy.intercept('GET', `**/api/1/datasets/?dataservice=${dataservice.id}**`, {
    statusCode: 200,
    body: {
      data: datasets,
      total: datasets.length,
      page: 1,
      page_size: 20,
      next_page: null,
      previous_page: null
    }
  }).as('getDataserviceDatasets')

  return dataservice
}

describe('Dataservices (API) - Detail Page', () => {
  let testDataservice: Dataservice
  let testDatasets: DatasetV2[]

  beforeEach(() => {
    cy.mockMatomo()
    cy.simulateDisconnectedUser()
    cy.mockStaticDatagouv()
    cy.mockDatagouvObjectList('discussions')

    // Mock contact roles endpoint
    cy.intercept('GET', '**/api/1/contacts/roles/', {
      statusCode: 200,
      body: []
    }).as('getContactRoles')

    // Create test datasets associated with the dataservice
    testDatasets = datasetFactory.many(2)

    // Create a test dataservice with all the fields needed
    testDataservice = createMockedDataservice(
      {
        availability: 99.9,
        business_documentation_url: 'https://example.com/docs/business',
        machine_documentation_url: 'https://example.com/docs/swagger.json',
        contact_points: [
          {
            id: 'contact-1',
            name: 'API Support',
            email: 'api-support@example.com',
            role: 'contact'
          }
        ]
      },
      testDatasets
    )
  })

  describe('Basic Information Display', () => {
    beforeEach(() => {
      cy.visit(`/dataservices/${testDataservice.id}`)
      cy.wait(`@get_dataservices_${testDataservice.id}`)
    })

    it('should display the dataservice title', () => {
      cy.get('h1').should('contain', testDataservice.title)
    })

    it('should display the dataservice description', () => {
      cy.contains(testDataservice.description).should('be.visible')
    })

    it('should display breadcrumb navigation', () => {
      cy.get('nav[aria-label="vous êtes ici :"]').should('exist')
      cy.get('nav[aria-label="vous êtes ici :"]')
        .contains('Accueil')
        .should('exist')
      cy.get('nav[aria-label="vous êtes ici :"]')
        .contains('API')
        .should('exist')
      cy.get('nav[aria-label="vous êtes ici :"]')
        .contains(testDataservice.title)
        .should('exist')
    })
  })

  describe('Producer Information', () => {
    beforeEach(() => {
      cy.visit(`/dataservices/${testDataservice.id}`)
      cy.wait(`@get_dataservices_${testDataservice.id}`)
    })

    it('should display producer section', () => {
      cy.contains('h2', 'Producteur').should('be.visible')
    })

    it('should display organization name', () => {
      cy.contains(
        testDataservice.organization?.name || 'no org in test data'
      ).should('be.visible')
    })
  })

  describe('Metadata Display', () => {
    beforeEach(() => {
      cy.visit(`/dataservices/${testDataservice.id}`)
      cy.wait(`@get_dataservices_${testDataservice.id}`)
    })

    it('should display last update date', () => {
      cy.contains('Dernière mise à jour').should('be.visible')
    })

    it('should display rate limiting information when available', () => {
      cy.contains("Limite d'appels").should('be.visible')
      cy.contains(testDataservice.rate_limiting).should('be.visible')
    })

    it('should display availability percentage', () => {
      cy.contains('Taux de disponibilité').should('be.visible')
      cy.contains('99.9%').should('be.visible')
    })

    it('should display access type badge', () => {
      cy.contains('Accès').should('be.visible')
      cy.contains('Ouvert').should('be.visible')
    })
  })

  describe('Contact Points', () => {
    beforeEach(() => {
      cy.visit(`/dataservices/${testDataservice.id}`)
      cy.wait(`@get_dataservices_${testDataservice.id}`)
    })

    it('should display contact points when available', () => {
      cy.contains('Contact').should('be.visible')
      cy.contains('API Support').should('be.visible')
    })
  })

  describe('Documentation Links', () => {
    beforeEach(() => {
      cy.visit(`/dataservices/${testDataservice.id}`)
      cy.wait(`@get_dataservices_${testDataservice.id}`)
      cy.intercept('GET', 'https://example.com/docs/swagger.json', {
        statusCode: 200,
        body: {}
      }).as('getSwagger')
    })

    it('should display business documentation button when available', () => {
      cy.contains('Documentation métier').should('be.visible')
    })

    it('should display swagger documentation section when available', () => {
      cy.contains('Swagger').should('be.visible')
    })

    it('should toggle swagger documentation when clicked', () => {
      // Initially, swagger should be collapsed
      cy.get('.swagger-toggle').should('be.visible')

      // Click to expand
      cy.get('.swagger-toggle').click()

      // swagger spec is called
      cy.wait('@getSwagger')
    })
  })

  describe('Tabs Navigation', () => {
    beforeEach(() => {
      cy.visit(`/dataservices/${testDataservice.id}`)
      cy.wait(`@get_dataservices_${testDataservice.id}`)
    })

    it('should display all three tabs', () => {
      cy.contains('button', 'Données').should('be.visible')
      cy.contains('button', 'Discussions').should('be.visible')
      cy.contains('button', 'Informations').should('be.visible')
    })

    it('should show datasets tab by default', () => {
      cy.wait('@getDataserviceDatasets')

      // The datasets tab content should be visible
      cy.get('#tab-content-0').should('be.visible')
      cy.contains(`${testDatasets.length} jeux de données`).should('be.visible')
    })

    it('should display associated datasets', () => {
      cy.wait('@getDataserviceDatasets')

      testDatasets.forEach((dataset) => {
        cy.contains(dataset.title).should('be.visible')
      })
    })

    it('should switch to discussions tab when clicked', () => {
      cy.contains('button', 'Discussions').click()

      // Discussions tab content should be visible
      cy.get('#tab-content-1').should('be.visible')
      cy.contains("Il n'y a pas encore de discussion pour cette API").should(
        'be.visible'
      )
    })

    it('should switch to informations tab when clicked', () => {
      cy.contains('button', 'Informations').click()

      // Informations tab content should be visible
      cy.get('#tab-content-2').should('be.visible')
      cy.contains('Informations techniques').should('be.visible')
      cy.contains('ID').should('be.visible')
      cy.contains(testDataservice.id).should('be.visible')
    })
  })

  describe('Access Type And Availability Variations', () => {
    it('should display "Ouvert avec compte" badge for open_with_account access', () => {
      const restrictedDataservice = createMockedDataservice({
        access_type: 'open_with_account'
      })

      cy.visit(`/dataservices/${restrictedDataservice.id}`)
      cy.wait(`@get_dataservices_${restrictedDataservice.id}`)

      cy.contains('Ouvert avec compte').should('be.visible')
    })

    it('should display "Restreint" badge for restricted access', () => {
      const restrictedDataservice = createMockedDataservice({
        access_type: 'restricted',
        authorization_request_url: 'https://example.com/request-access'
      })

      cy.visit(`/dataservices/${restrictedDataservice.id}`)
      cy.wait(`@get_dataservices_${restrictedDataservice.id}`)

      cy.contains('Restreint').should('be.visible')
      cy.contains("Faire une demande d'habilitation").should('be.visible')
    })

    it('should handle dataservice without availability', () => {
      const noAvailabilityDataservice = createMockedDataservice({
        availability: null
      })

      cy.visit(`/dataservices/${noAvailabilityDataservice.id}`)
      cy.wait(`@get_dataservices_${noAvailabilityDataservice.id}`)

      cy.contains('Taux de disponibilité').should('be.visible')
      cy.contains('Non communiqué').should('be.visible')
    })
  })

  describe('Empty States', () => {
    it('should handle dataservice without datasets', () => {
      // Create a dataservice with no datasets
      const emptyDataservice = createMockedDataservice()

      cy.visit(`/dataservices/${emptyDataservice.id}`)
      cy.wait(`@get_dataservices_${emptyDataservice.id}`)

      cy.contains('0 jeu de données').should('be.visible')
    })
  })

  describe('Indicator datasets', () => {
    it('should display indicator datasets with the Indicateur badge', () => {
      // Create a mix of regular datasets and indicator datasets
      const regularDataset = datasetFactory.one({
        overrides: { title: 'Regular Dataset Title' }
      })
      const indicatorDataset = createIndicator({
        title: 'Indicator Dataset Title'
      })

      const ds = createMockedDataservice({}, [regularDataset, indicatorDataset])

      cy.visit(`/dataservices/${ds.id}`)
      cy.wait(`@get_dataservices_${ds.id}`)
      cy.wait('@getDataserviceDatasets')

      // Check that both datasets are displayed
      cy.contains('Regular Dataset Title').should('be.visible')
      cy.contains('Indicator Dataset Title').should('be.visible')

      // Check that the indicator dataset has the "Indicateur" badge
      cy.contains('Indicator Dataset Title')
        .closest('.fr-col-12')
        .find('.fr-badge')
        .contains('Indicateur')
        .should('be.visible')

      // Check that the regular dataset does NOT have the "Indicateur" badge
      cy.contains('Regular Dataset Title')
        .closest('.fr-col-12')
        .find('.fr-badge')
        .should('not.exist')
    })
  })
})
