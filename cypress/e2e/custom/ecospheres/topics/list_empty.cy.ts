describe('Topics - Empty List and Reset Filters', () => {
  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    cy.mockSpatialLevels()
    cy.mockSpatialZone()
    cy.mockSpatialZonesSuggest()
    cy.mockUniverseOrganizations()
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
      // SearchSelectFilter stores the full prefixed value in the URL
      cy.visit(
        '/bouquets?theme=ecospheres-theme-mieux-consommer&organization=534fff4ca3a7292c64a77c95'
      )
      cy.wait('@get_topics_list')
      cy.wait('@get_universe_organizations')

      // Verify all filters are in the URL
      cy.url().should('include', 'theme=ecospheres-theme-mieux-consommer')
      cy.url().should('include', 'organization=534fff4ca3a7292c64a77c95')

      // Verify the theme filter is visually selected (ComboboxInput shows the selected value)
      cy.contains('label.fr-label', 'Thématique')
        .closest('.fr-input-group')
        .find('input')
        .should('not.have.value', '')

      // Verify the organization filter is visually selected
      cy.contains('label.fr-label', 'Organisation')
        .closest('.fr-input-group')
        .find('input')
        .should('not.have.value', '')

      // Click "Réinitialiser les filtres" button
      cy.contains('button', 'Réinitialiser les filtres').click()

      // Wait for the reset to complete
      cy.wait('@get_topics_list')

      // Verify URL no longer contains filter parameters
      cy.url().should('not.include', 'theme=')
      cy.url().should('not.include', 'organization=')

      // Verify the theme filter is actually cleared (input is empty)
      cy.contains('label.fr-label', 'Thématique')
        .closest('.fr-input-group')
        .find('input')
        .should('have.value', '')

      // Verify the organization filter is actually cleared (input is empty)
      cy.contains('label.fr-label', 'Organisation')
        .closest('.fr-input-group')
        .find('input')
        .should('have.value', '')
    })
  })
})
