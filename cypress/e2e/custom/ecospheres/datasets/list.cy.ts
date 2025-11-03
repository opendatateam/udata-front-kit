import type { DatasetV2 } from '@datagouv/components-next'
import { datasetFactory } from 'cypress/support/factories/datasets_factory'
import { mockOrganizationsLists } from '../mocks'

describe('Datasets - List Page', () => {
  let testDatasets: DatasetV2[]

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    mockOrganizationsLists()
    testDatasets = datasetFactory.many(3)
    cy.mockDatagouvObjectList('datasets', testDatasets)
  })

  it('should display the list of dataservices', () => {
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

  it('should filter by organization when ADEME is selected', () => {
    cy.visit('/datasets')

    // Wait for the initial API calls to complete
    cy.wait('@get_datasets_list')
    cy.wait('@mockUniverseOrganizations')

    // Click on the multiselect to open the dropdown
    cy.contains('label.fr-label', 'Organisation')
      .parent('.fr-select-group')
      .within(() => {
        cy.get('.multiselect-wrapper').click()
      })

    // Select ADEME from the dropdown options
    cy.get('.multiselect-option[aria-label="ADEME"]').click()

    // Verify the URL contains the organization parameter
    cy.url().should('include', 'organization=534fff4ca3a7292c64a77c95')

    // Wait for the filtered API call
    cy.wait('@get_datasets_list')
  })
})
