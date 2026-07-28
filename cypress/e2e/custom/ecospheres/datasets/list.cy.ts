import type { DatasetV2 } from '@datagouv/components-next'
import { datagouvResponseBuilder } from 'cypress/support/datagouv_mocks'
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
    cy.url().should('include', 'org=534fff4ca3a7292c64a77c95')

    // Wait for the filtered API call
    cy.wait('@get_datasets_list')
  })

  it('should navigate correctly when switching type while org filter is active', () => {
    cy.visit('/datasets')
    cy.wait('@get_datasets_list')
    cy.wait('@get_universe_organizations')

    cy.selectFilterValue('Organisation', 'ADEME')
    cy.url().should('include', 'org=534fff4ca3a7292c64a77c95')

    // Switch to Indicators type — must navigate to /indicators, not stay on /datasets
    cy.contains('label', 'Indicateurs').click()
    cy.url().should('include', '/indicators')
    cy.url().should('not.include', '/datasets')
  })

  it('should not trigger a background dataservices search when a datasets-only filter changes', () => {
    cy.visit('/datasets')
    cy.wait('@get_datasets_list')

    cy.get('@get_dataservices_list.all').its('length').as('countBefore')

    // inspire has typeKeys: ['datasets'] — selecting it must only re-search datasets
    cy.expectActionToCallApi(
      () => cy.selectFilterValue('Thème INSPIRE', 'Adresses'),
      'datasets',
      { tag: 'adresses' }
    )

    cy.get('@countBefore').then((countBefore) => {
      cy.get('@get_dataservices_list.all').should('have.length', countBefore)
    })
  })

  it('should clear org filter when switching to a type with a different org list', () => {
    cy.visit('/datasets')
    cy.wait('@get_datasets_list')
    cy.wait('@get_universe_organizations')

    cy.selectFilterValue('Organisation', 'ADEME')
    cy.url().should('include', 'org=534fff4ca3a7292c64a77c95')

    // Switch to API (dataservices) — also has an org filter but different values
    cy.contains('label', 'API').click()
    cy.url().should('include', '/dataservices')
    cy.url().should('not.include', 'org=')
  })

  it('should persist filtered results on page reload', () => {
    const filteredDataset = datasetFactory.one({
      overrides: { title: 'Filtered Dataset' }
    })

    // Filtered request returns immediately with data.
    // Other datasets requests (initial unfiltered + indicators) return empty after a delay
    // We're testing that initial unfiltered results (fired first, arriving last) do not overwrite filtered ones
    cy.intercept('GET', /.*data\.gouv\.fr\/api\/\d\/datasets.*/, (req) => {
      if (req.url.includes('tag=adresses')) {
        req.reply({
          statusCode: 200,
          body: datagouvResponseBuilder([filteredDataset])
        })
      } else {
        req.reply({
          delay: 300,
          statusCode: 200,
          body: datagouvResponseBuilder([])
        })
      }
    }).as('get_datasets_list')

    // Visit with the custom filter already in the URL (simulates a page reload)
    cy.visit('/datasets?inspire=adresses')

    // Filtered results should appear once the filtered request completes
    cy.get('.search-results').should('contain', 'Filtered Dataset')

    // Wait beyond the stale response delay (300ms) so it has time to land.
    cy.wait(400)

    cy.get('.search-results').should('contain', 'Filtered Dataset')
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
    // Check that the indicator dataset has the "Indicateur" badge
    cy.contains('.indicator-card-wrapper', 'Indicator Dataset Title')
      .find('.indicator-badge')
      .should('contain.text', 'Indicateur')
      .and('be.visible')

    // Only one indicator badge should exist in the list (the regular dataset has none)
    cy.get('.indicator-badge').should('have.length', 1)
  })
})
