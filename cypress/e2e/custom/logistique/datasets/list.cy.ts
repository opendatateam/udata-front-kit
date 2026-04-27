import { datasetFactory } from 'cypress/support/factories/datasets_factory'

describe('Datasets - List Page (no filters)', () => {
  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    cy.mockDatagouvObjectList('datasets', datasetFactory.many(3))
  })

  it('should display the list full width when no filters are configured', () => {
    cy.visit('/datasets')
    cy.wait('@get_datasets_list')

    // GlobalSearch renders section.search-results with no sidebar sibling when there are no filters
    cy.get('section.search-results').should('exist')
    cy.get('section.search-results').siblings().should('have.length', 0)
  })
})
