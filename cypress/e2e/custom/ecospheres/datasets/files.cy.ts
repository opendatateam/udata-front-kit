import { datasetFactory } from 'cypress/support/factories/datasets_factory'
import { resourceFactory } from 'cypress/support/factories/resources_factory'

describe('Dataset Page - Fichiers Tab', () => {
  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
  })

  it('should display resources with the old navigation', () => {
    const dataset = datasetFactory.one()
    const resource = resourceFactory.one({
      overrides: { title: 'Test resource' }
    })
    cy.mockDatasetAndRelatedObjects(dataset, [resource])

    cy.visit(`/datasets/${dataset.id}`)
    cy.contains('Test resource').should('be.visible')
  })

  it('should display resources with the new resources explorer enabled', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('resources_explorer_enabled', 'true')
    })

    const dataset = datasetFactory.one()
    const resource = resourceFactory.one({
      overrides: { title: 'Test resource' }
    })
    cy.mockDatasetAndRelatedObjects(dataset, [resource])

    cy.visit(`/datasets/${dataset.id}`)
    // Confirms the new explorer actually mounted, not just that the resource is visible.
    cy.contains("Revenir sur l'ancienne navigation").should('be.visible')
    cy.contains('Test resource').should('be.visible')
  })

  it('should copy the on-site resource link when using the new resources explorer', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('resources_explorer_enabled', 'true')
    })

    const dataset = datasetFactory.one()
    const resource = resourceFactory.one({
      overrides: { title: 'Test resource' }
    })
    cy.mockDatasetAndRelatedObjects(dataset, [resource])

    cy.visit(`/datasets/${dataset.id}`)
    cy.contains("Revenir sur l'ancienne navigation").should('be.visible')

    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').as('writeText')
    })
    cy.contains('Copier le lien').click()

    cy.get('@writeText').should(
      'have.been.calledWith',
      `${Cypress.config('baseUrl')}/datasets/${dataset.slug}?resource_id=${resource.id}`
    )
  })
})
