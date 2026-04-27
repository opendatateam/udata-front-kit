import type { DatasetV2 } from '@datagouv/components-next'
import { datasetFactory } from 'cypress/support/factories/datasets_factory'
import { createIndicator } from '../indicators/support'

describe('Datasets - List Page', () => {
  let testDatasets: DatasetV2[]

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    testDatasets = datasetFactory.many(3)
    cy.mockListApis('datasets', testDatasets)
  })

  it('should display the list of datasets', () => {
    cy.visit('/datasets')

    // Wait for the API call to complete
    cy.wait('@get_datasets_list')

    // Check that the page title is present
    cy.contains('Toutes les données').should('be.visible')

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

    cy.selectFilterValue('Organisation', 'ADEME')

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

    // The indicator card wraps both the badge and the DatasetCard.
    // Use the wrapper as the anchor to avoid fragile up-traversal across component boundaries.
    cy.contains('.indicator-card-wrapper', 'Indicator Dataset Title')
      .find('.indicator-badge')
      .should('contain.text', 'Indicateur')
      .and('be.visible')

    // Only one indicator badge should exist in the list (the regular dataset has none)
    cy.get('.indicator-badge').should('have.length', 1)
  })
})
