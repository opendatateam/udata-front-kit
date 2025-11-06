import type { DatasetV2 } from '@datagouv/components-next'
import { datasetFactory } from 'cypress/support/factories/datasets_factory'

describe('Culture - Datasets List Page', () => {
  let testDatasets: DatasetV2[]

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    testDatasets = datasetFactory.many(3)
    cy.mockDatagouvObjectList('datasets', testDatasets)
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
    it('should filter by category when a category is selected', () => {
      cy.visit('/datasets')

      // Wait for the initial API call to complete
      cy.wait('@get_datasets_list')

      // Click on the category select to open the dropdown
      cy.contains('label.fr-label', 'Catégories')
        .parent('.fr-select-group')
        .within(() => {
          cy.get('.multiselect-wrapper').click()
        })

      // Select "Musique" from the dropdown options
      cy.contains('.multiselect-option', 'Musique', {
        matchCase: false
      }).click()

      // Verify the URL contains the tag parameter
      cy.url().should('include', 'tag=musique')

      // Wait for the filtered API call
      cy.wait('@get_datasets_list')
    })

    it('should filter by organization type when a type is selected', () => {
      cy.visit('/datasets')

      // Wait for the initial API call to complete
      cy.wait('@get_datasets_list')

      // Click on the organization type select to open the dropdown
      cy.contains('label.fr-label', "Type d'organisation")
        .parent('.fr-select-group')
        .within(() => {
          cy.get('.multiselect-wrapper').click()
        })

      // Select "Service public" from the dropdown options
      cy.contains('.multiselect-option', 'Service public', {
        matchCase: false
      }).click()

      // Verify the URL contains the organization_badge parameter
      cy.url().should('include', 'organization_badge=public-service')

      // Wait for the filtered API call
      cy.wait('@get_datasets_list')
    })

    it('should apply both filters simultaneously', () => {
      cy.visit('/datasets')

      // Wait for the initial API call to complete
      cy.wait('@get_datasets_list')

      // Select a category
      cy.contains('label.fr-label', 'Catégories')
        .parent('.fr-select-group')
        .within(() => {
          cy.get('.multiselect-wrapper').click()
        })
      cy.contains('.multiselect-option', 'Livre', { matchCase: false }).click()

      // Verify the URL contains the tag parameter
      cy.url().should('include', 'tag=livre')

      // Wait for the filtered API call
      cy.wait('@get_datasets_list')

      // Select an organization type
      cy.contains('label.fr-label', "Type d'organisation")
        .parent('.fr-select-group')
        .within(() => {
          cy.get('.multiselect-wrapper').click()
        })
      cy.contains('.multiselect-option', 'Association', {
        matchCase: false
      }).click()

      // Verify the URL contains both parameters
      cy.url().should('include', 'tag=livre')
      cy.url().should('include', 'organization_badge=association')

      // Wait for the filtered API call
      cy.wait('@get_datasets_list')
    })
  })
})
