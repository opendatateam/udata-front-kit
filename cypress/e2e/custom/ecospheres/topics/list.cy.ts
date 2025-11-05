import type { Topic } from '@/model/topic'
import { topicFactory } from 'cypress/support/factories/topics_factory'
import { mockUniverseOrganizations } from '../mocks'

describe('Topics - List Page', () => {
  let testTopics: Topic[]

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    cy.mockSpatialLevels()
    cy.mockSpatialZonesSuggest()
    mockUniverseOrganizations()
    testTopics = topicFactory.many(3)
    cy.mockDatagouvObjectList('topics', testTopics)
  })

  describe('List Display', () => {
    it('should display the list of topics', () => {
      cy.visit('/bouquets')
      cy.wait('@get_topics_list')

      // Check that all topics are displayed
      testTopics.forEach((topic) => {
        cy.contains(topic.name).should('be.visible')
      })
    })

    it('should filter by organization when ADEME is selected', () => {
      cy.visit('/bouquets')

      // Wait for the initial API calls to complete
      cy.wait('@get_topics_list')
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
      cy.wait('@get_topics_list')
    })

    it('should filter by theme when a theme is selected', () => {
      cy.visit('/bouquets')

      // Wait for the initial API calls to complete
      cy.wait('@get_topics_list')

      // Click on the theme select to open the dropdown
      cy.contains('label.fr-label', 'Thématique')
        .parent('.fr-select-group')
        .within(() => {
          cy.get('.multiselect-wrapper').click()
        })

      // Select "Mieux consommer" from the dropdown options
      cy.get('.multiselect-option[aria-label="Mieux consommer"]').click()

      // Verify the URL contains the theme parameter
      cy.url().should('include', 'theme=mieux-consommer')

      // Wait for the filtered API call
      cy.wait('@get_topics_list')
    })

    it('should filter by spatial coverage when a zone is selected', () => {
      cy.visit('/bouquets')

      // Wait for the initial API calls to complete
      cy.wait('@get_topics_list')

      // Find the spatial coverage multiselect and click to activate it
      cy.contains('label.fr-label', 'Couverture territoriale')
        .parent('.fr-select-group')
        .within(() => {
          cy.get('.multiselect-wrapper').click()
          cy.get('input.multiselect-search').type('Paris')
        })

      // Wait for the suggest API call
      cy.wait('@get_spatial_zones_suggest')

      // Select the first option from the spatial coverage dropdown specifically
      cy.get('#select-spatial-coverage-dropdown .multiselect-option')
        .first()
        .should('be.visible')
        .click()

      // Verify the URL contains the geozone parameter (first zone of mock)
      cy.url().should('include', 'geozone=fr:commune:75056')

      // Wait for the filtered API call
      cy.wait('@get_topics_list')
    })
  })

  describe('Draft Checkbox', () => {
    it('should not show "Afficher les brouillons" checkbox when disconnected', () => {
      cy.visit('/bouquets')
      cy.wait('@get_topics_list')

      // Verify the checkbox does not exist
      cy.contains('Afficher les brouillons').should('not.exist')
    })

    it('should show "Afficher les brouillons" checkbox when connected', () => {
      // Simulate connected user
      cy.simulateConnectedUser({
        id: 'test-user-id',
        first_name: 'Test',
        last_name: 'User'
      })

      cy.visit('/bouquets')
      cy.wait('@get_topics_list')

      // Verify the checkbox exists and is visible
      cy.contains('Afficher les brouillons').should('be.visible')
    })

    it('should update URL parameter when clicking "Afficher les brouillons"', () => {
      // Simulate connected user
      cy.simulateConnectedUser({
        id: 'test-user-id',
        first_name: 'Test',
        last_name: 'User'
      })

      cy.visit('/bouquets')
      cy.wait('@get_topics_list')

      // Initially, include_private should not be in URL
      cy.url().should('not.include', 'include_private')

      // Verify the checkbox is checked by default
      cy.contains('Afficher les brouillons')
        .parent()
        .find('input[type="checkbox"]')
        .should('be.checked')

      // Click the checkbox to hide drafts
      cy.contains('Afficher les brouillons').click()

      // Verify URL includes include_private=false
      cy.url().should('include', 'include_private=false')

      // Wait for the API call with the new parameter
      cy.wait('@get_topics_list')

      // Click again to show drafts
      cy.contains('Afficher les brouillons').click()

      // Verify URL includes include_private=true
      cy.url().should('include', 'include_private=true')
    })
  })
})
