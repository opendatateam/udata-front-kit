import { createIndicator, createIndicatorResource } from './support'

describe('Indicator Viz', () => {
  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
  })

  describe('No Datavisualisation Configured', () => {
    it('should not display the previsualisation', () => {
      const indicator = createIndicator({}, { enable_visualization: false })
      cy.mockDatasetAndRelatedObjects(indicator)
      cy.visit(`/indicators/${indicator.id}`)
      cy.contains('Prévisualisation').should('not.exist')
    })
  })

  describe('Prévisualisation Tab', () => {
    it('should display an error when the tabular API fails', () => {
      const indicatorWithViz = createIndicator(
        {},
        { enable_visualization: true }
      )
      const vizResource = createIndicatorResource()
      cy.mockDatasetAndRelatedObjects(indicatorWithViz, [vizResource])
      cy.intercept(
        'GET',
        `https://tabular-api*.data.gouv.fr/api/resources/${vizResource.id}/data/**`,
        { statusCode: 500, body: 'Internal Server Error' }
      )
      cy.visit(`/indicators/${indicatorWithViz.id}`)
      cy.contains('Prévisualisation').click()
      cy.contains('Erreur lors du chargement').should('be.visible')
      cy.contains('k: millier, M: million, Md: milliard').should('not.exist')
    })

    it('should display a no-data message when viz is enabled and the API returns no data', () => {
      const indicatorWithViz = createIndicator(
        {},
        { enable_visualization: true }
      )
      const vizResource = createIndicatorResource('fr')
      cy.mockDatasetAndRelatedObjects(indicatorWithViz, [vizResource])
      cy.intercept(
        'GET',
        `https://tabular-api*.data.gouv.fr/api/resources/${vizResource.id}/data/**`,
        { statusCode: 200, body: { data: [] } }
      )
      cy.visit(`/indicators/${indicatorWithViz.id}`)
      cy.contains('Prévisualisation').click()
      cy.contains(
        'Aucune donnée disponible pour le territoire sélectionné.'
      ).should('be.visible')
      cy.get('canvas').should('not.exist')
    })
  })
})
