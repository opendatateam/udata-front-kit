import type { DatasetV2 } from '@datagouv/components-next'
import { datasetFactory } from 'cypress/support/factories/datasets_factory'
import { createIndicator } from '../indicators/support'
import { mockUniverseOrganizations } from '../mocks'

describe('Datasets - List Page', () => {
  let testDatasets: DatasetV2[]

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    mockUniverseOrganizations()
    testDatasets = datasetFactory.many(3)
    cy.mockDatagouvObjectList('datasets', testDatasets)
  })

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

  it('should filter by organization when ADEME is selected', () => {
    cy.visit('/datasets')

    // Wait for the initial API calls to complete
    cy.wait('@get_datasets_list')
    cy.wait('@get_universe_organizations')

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

  it('should display indicator datasets with the Indicateur badge', () => {
    // Create a mix of regular datasets and indicator datasets
    const regularDataset = datasetFactory.one({
      overrides: { title: 'Regular Dataset Title' }
    })
    const indicatorDataset = createIndicator({
      title: 'Indicator Dataset Title'
    })

    cy.mockDatagouvObjectList('datasets', [regularDataset, indicatorDataset])

    cy.visit('/datasets')
    cy.wait('@get_datasets_list')

    // Check that both datasets are displayed
    cy.contains('Regular Dataset Title').should('be.visible')
    cy.contains('Indicator Dataset Title').should('be.visible')

    // Check that the indicator dataset has the "Indicateur" badge
    cy.contains('Indicator Dataset Title')
      .closest('li')
      .find('.fr-badge')
      .contains('Indicateur')
      .should('be.visible')

    // Check that the regular dataset does NOT have the "Indicateur" badge
    cy.contains('Regular Dataset Title')
      .closest('li')
      .find('.fr-badge')
      .should('not.exist')
  })
})
