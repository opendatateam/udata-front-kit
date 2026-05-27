import { datasetFactory } from 'cypress/support/factories/datasets_factory'

describe('Unified search – live result count announcement', () => {
  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
  })

  it('announces multiple results as "N résultats"', () => {
    cy.mockListApis('datasets', datasetFactory.many(5))
    cy.visit('/datasets')
    cy.wait('@get_datasets_list')

    cy.get('[aria-live="assertive"]')
      .find('li')
      .last()
      .should('have.text', '5 résultats')
  })

  it('announces a single result as "1 résultat"', () => {
    cy.mockListApis('datasets', datasetFactory.many(1))
    cy.visit('/datasets')
    cy.wait('@get_datasets_list')

    cy.get('[aria-live="assertive"]')
      .find('li')
      .last()
      .should('have.text', '1 résultat')
  })

  it('announces "Aucun résultat" when there are no results', () => {
    cy.mockListApis('datasets', [])
    cy.visit('/datasets')
    cy.wait('@get_datasets_list')

    cy.get('[aria-live="assertive"]')
      .find('li')
      .last()
      .should('have.text', 'Aucun résultat')
  })

  it('announces page number on pagination', () => {
    cy.mockListApis('datasets', datasetFactory.many(5))
    cy.visit('/datasets?page=2')
    cy.wait('@get_datasets_list')

    cy.get('[aria-live="assertive"]')
      .find('li')
      .last()
      .should('have.text', 'Page 2, 5 résultats')
  })

  it('includes the search query in the live-region page title', () => {
    cy.mockListApis('datasets', datasetFactory.many(2))
    cy.visit('/datasets?q=test')
    cy.wait('@get_datasets_list')

    const { pages, website } = Cypress.env('siteConfig')
    const pageTitle = pages.datasets.title

    cy.get('[aria-live="assertive"]')
      .find('li')
      .first()
      .should('have.text', `Page ${pageTitle} pour "test" | ${website.title}`)
  })
})
