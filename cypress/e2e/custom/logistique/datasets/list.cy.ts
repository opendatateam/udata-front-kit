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

    cy.get('.list-container').should('exist')
    cy.get('.list-container').should('not.have.class', 'fr-col-md-8')
    cy.get('.fr-sidemenu').should('not.exist')
  })
})
