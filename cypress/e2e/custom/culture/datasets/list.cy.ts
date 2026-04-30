import type { DatasetV2 } from '@datagouv/components-next'
import { datasetFactory } from 'cypress/support/factories/datasets_factory'

describe('Culture - Datasets List Page', () => {
  let testDatasets: DatasetV2[]

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    testDatasets = datasetFactory.many(3)
    cy.mockListApis('datasets', testDatasets)
  })

  describe('List Display', () => {
    it('should display the list of datasets', () => {
      cy.visit('/datasets')

      // Wait for the API call to complete
      cy.wait('@get_datasets_list')

      // Check that the page title is present
      cy.contains('Jeux de données').should('be.visible')

      // Check that all datasets are displayed
      testDatasets.forEach((dataset) => {
        cy.contains(dataset.title).should('be.visible')
      })
    })
  })

  describe('Filters', () => {
    beforeEach(() => {
      cy.visit('/datasets')
    })

    it('should filter by category when a category is selected', () => {
      // Select "Musique" from the category filter and verify the API call
      cy.expectActionToCallApi(
        () => cy.selectFilterValue('Catégories', 'Musique'),
        'datasets',
        { tag: 'musique' }
      )

      // Verify the URL contains the tag parameter
      cy.url().should('include', 'tag=musique')
    })

    it('should filter by organization type when a type is selected', () => {
      // Select "Service public" from the organization type filter and verify the API call
      cy.expectActionToCallApi(
        () => cy.selectFilterValue("Type d'organisation", 'Service public'),
        'datasets',
        { organization_badge: 'public-service' }
      )

      // Verify the URL contains the organization_badge parameter
      cy.url().should('include', 'organization_badge=public-service')
    })

    it('should apply both filters simultaneously', () => {
      // Select a category
      cy.expectActionToCallApi(
        () => cy.selectFilterValue('Catégories', 'Livre'),
        'datasets',
        { tag: 'livre' }
      )

      cy.expectActionToCallApi(
        () => cy.selectFilterValue("Type d'organisation", 'Association'),
        'datasets',
        { tag: 'livre', organization_badge: 'association' },
        { drain: false }
      )
    })
  })
})
