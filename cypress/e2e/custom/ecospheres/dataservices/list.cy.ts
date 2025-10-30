import type { DataserviceWithRel } from '@/model/dataservice'
import { dataserviceFactory } from '../../../../support/factories/dataservices_factory'
import { mockOrganizationsLists } from '../mocks'

describe('Dataservices (API) - List Page', () => {
  let testDataservices: DataserviceWithRel[]

  beforeEach(() => {
    cy.mockMatomo()
    mockOrganizationsLists()

    // Create test dataservices
    testDataservices = dataserviceFactory.many(3)

    // Mock the API response
    cy.mockDatagouvObjectList('dataservices', testDataservices)
  })

  it('should display the list of dataservices', () => {
    cy.visit('/dataservices')

    // Wait for the API call to complete
    cy.wait('@get_dataservices_list')

    // Check that the page title is present
    cy.contains('API').should('be.visible')

    // Check that all dataservices are displayed
    testDataservices.forEach((dataservice) => {
      cy.contains(dataservice.title).should('be.visible')
    })
  })

  it('should filter by organization when ADEME is selected', () => {
    cy.visit('/dataservices')

    // Wait for the initial API calls to complete
    cy.wait('@get_dataservices_list')
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
    cy.wait('@get_dataservices_list')
  })

  it('should display dataservice cards with key information', () => {
    cy.visit('/dataservices')
    cy.wait('@get_dataservices_list')

    // Check first dataservice card displays key information
    const firstDataservice = testDataservices[0]

    cy.contains(firstDataservice.title).should('be.visible')
    cy.contains(firstDataservice.description).should('be.visible')
    cy.contains(
      firstDataservice.organization?.name || 'no org in test data'
    ).should('be.visible')
  })

  it('should navigate to dataservice detail page when clicking on a card', () => {
    cy.visit('/dataservices')
    cy.wait('@get_dataservices_list')

    const firstDataservice = testDataservices[0]

    // Mock the detail page API call
    cy.mockDatagouvObject('dataservices', firstDataservice.id, firstDataservice)

    // Click on the first dataservice card
    cy.contains(firstDataservice.title).click()

    // Check that we're on the detail page
    cy.url().should('include', `/dataservices/${firstDataservice.id}`)
  })

  it('should handle empty dataservices list', () => {
    // Mock empty response
    cy.mockDatagouvObjectList('dataservices', [])

    cy.visit('/dataservices')
    cy.wait('@get_dataservices_list')

    // Should show appropriate message or empty state
    cy.contains('Aucun résultat ne correspond à votre recherche').should(
      'exist'
    )
  })

  it('should display breadcrumb navigation', () => {
    cy.visit('/dataservices')
    cy.wait('@get_dataservices_list')

    // Check breadcrumb exists and contains home link
    cy.get('nav[aria-label="vous êtes ici :"]').should('exist')
    cy.get('nav[aria-label="vous êtes ici :"]')
      .contains('Accueil')
      .should('exist')
  })
})
