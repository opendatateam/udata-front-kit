import { mockUniverseOrganizations } from '../mocks'

describe('Topics - Empty List and Reset Filters', () => {
  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    cy.mockSpatialLevels()
    cy.mockSpatialZone()
    cy.mockSpatialZonesSuggest()
    mockUniverseOrganizations()
  })

  describe('Reset Filters', () => {
    it('should clear all filter values when clicking "Réinitialiser les filtres"', () => {
      // Start with empty results
      cy.mockDatagouvObjectList('topics', [])
      cy.visit('/bouquets')
      cy.wait('@get_topics_list')

      // Verify "Réinitialiser les filtres" button appears when no results
      cy.contains('button', 'Réinitialiser les filtres').should('be.visible')

      // Navigate away and come back with all filters applied to test the reset
      cy.visit(
        '/bouquets?theme=mieux-consommer&organization=534fff4ca3a7292c64a77c95'
      )
      cy.wait('@get_topics_list')

      // Verify all filters are in the URL
      cy.url().should('include', 'theme=mieux-consommer')
      cy.url().should('include', 'organization=534fff4ca3a7292c64a77c95')

      // Verify the theme filter is visually selected in the UI
      cy.contains('label.fr-label', 'Thématique')
        .parent('.fr-select-group')
        .within(() => {
          cy.get('.multiselect-single-label').should('be.visible')
        })

      // Verify the organization filter is visually selected in the UI
      cy.contains('label.fr-label', 'Organisation')
        .parent('.fr-select-group')
        .within(() => {
          cy.get('.multiselect-single-label').should('be.visible')
        })

      // Click "Réinitialiser les filtres" button
      cy.contains('button', 'Réinitialiser les filtres').click()

      // Wait for the reset to complete
      cy.wait('@get_topics_list')

      // Verify URL no longer contains filter parameters
      cy.url().should('not.include', 'theme=')
      cy.url().should('not.include', 'organization=')

      // Verify the theme filter is actually cleared (not just the URL)
      cy.contains('label.fr-label', 'Thématique')
        .parent('.fr-select-group')
        .within(() => {
          // The multiselect should show the placeholder, not the selected value
          cy.get('.multiselect-placeholder').should('be.visible')
          cy.get('.multiselect-single-label').should('not.exist')
        })

      // Verify the organization filter is actually cleared (not just the URL)
      cy.contains('label.fr-label', 'Organisation')
        .parent('.fr-select-group')
        .within(() => {
          // The multiselect should show the placeholder, not the selected value
          cy.get('.multiselect-placeholder').should('be.visible')
          cy.get('.multiselect-single-label').should('not.exist')
        })
    })
  })
})
