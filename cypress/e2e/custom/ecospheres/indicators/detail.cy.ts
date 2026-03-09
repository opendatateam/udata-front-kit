import type { Indicator } from '@/custom/ecospheres/model/indicator'
import type { Dataservice, Reuse } from '@datagouv/components-next'
import { dataserviceFactory } from 'cypress/support/factories/dataservices_factory'
import { reuseFactory } from 'cypress/support/factories/reuses_factory'
import { createIndicator, createIndicatorResource } from './support'

describe('Indicator Detail View', () => {
  let indicator: Indicator

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()

    indicator = createIndicator({}, { enable_visualization: false })
    cy.mockDatasetAndRelatedObjects(indicator)
  })

  describe('Native attributes', () => {
    it('should display the indicator title', () => {
      cy.visit(`/indicators/${indicator.id}`)
      cy.contains(indicator.title).should('be.visible')
    })

    it('should display the indicator description', () => {
      cy.visit(`/indicators/${indicator.id}`)
      cy.contains(indicator.description).should('be.visible')
    })
  })

  describe('Custom Metadata In Informations Tab', () => {
    it('should display the thématique', () => {
      cy.visit(`/indicators/${indicator.id}`)
      cy.contains('Thématique').should('be.visible')
      cy.contains('Mieux consommer').should('be.visible')
    })

    it('should display the enjeu', () => {
      cy.visit(`/indicators/${indicator.id}`)
      cy.contains('Enjeu').should('be.visible')
      cy.contains('Biodiversité').should('be.visible')
    })

    it('should display the secteur', () => {
      cy.visit(`/indicators/${indicator.id}`)
      cy.contains('Secteur').should('be.visible')
      cy.contains('Energie').should('be.visible')
    })

    it('should display the levier', () => {
      cy.visit(`/indicators/${indicator.id}`)
      cy.contains('Levier').should('be.visible')
      cy.contains('Biogaz').should('be.visible')
    })

    it('should display the unité', () => {
      cy.visit(`/indicators/${indicator.id}`)
      cy.contains('Unité').should('be.visible')
      cy.contains('kg CO2').should('be.visible')
    })
  })

  describe('Custom Metadata In Technical Details Tab', () => {
    beforeEach(() => {
      cy.visit(`/indicators/${indicator.id}`)
      cy.contains('Détails technique').click()
    })

    it('should display the granularité de la couverture territoriale', () => {
      cy.contains('Granularité de la couverture territoriale').should(
        'be.visible'
      )
      cy.contains('Région française').should('be.visible')
    })
  })

  describe('Sources Tab', () => {
    beforeEach(() => {
      cy.visit(`/indicators/${indicator.id}`)
      cy.contains('Sources').click()
    })

    it('should display the informations calcul', () => {
      cy.contains('Informations calcul').should('be.visible')
      cy.contains('Responsable du calcul').should('be.visible')
      cy.contains('Méthode de calcul détaillée').should('be.visible')
    })

    it('should display source name and description', () => {
      cy.contains('Source 1').should('be.visible')
      cy.contains('Description de la source 1').should('be.visible')
    })

    it('should display source producteur and distributeur', () => {
      cy.contains('Producteur 1').should('be.visible')
      cy.contains('Distributeur 1').should('be.visible')
    })

    it('should display source URL', () => {
      cy.contains('https://example.com/source1').should('be.visible')
    })
  })

  describe('Réutilisations et API Tab', () => {
    it('should display dataservices when available', () => {
      const dataservices = dataserviceFactory.many<Dataservice>(2)
      const indicatorWithApis = createIndicator(
        {},
        { enable_visualization: false }
      )
      cy.mockDatasetAndRelatedObjects(indicatorWithApis, [], dataservices)
      cy.visit(`/indicators/${indicatorWithApis.id}`)
      cy.contains('Réutilisations et API').click()
      cy.contains(`${dataservices.length} API`).should('be.visible')
      cy.contains(dataservices[0].title).should('be.visible')
      cy.contains(dataservices[1].title).should('be.visible')
    })

    it('should display empty state when no dataservices', () => {
      cy.visit(`/indicators/${indicator.id}`)
      cy.contains('Réutilisations et API').click()
      cy.contains("Il n'y a pas encore d'API pour cet indicateur.").should(
        'be.visible'
      )
    })

    it('should display reuses when available', () => {
      const reuses = reuseFactory.many<Reuse>(2)
      const indicatorWithReuses = createIndicator(
        {},
        { enable_visualization: false }
      )
      cy.mockDatasetAndRelatedObjects(indicatorWithReuses, [], [], reuses)
      cy.visit(`/indicators/${indicatorWithReuses.id}`)
      cy.contains('Réutilisations et API').click()
      cy.contains(reuses[0].title).should('be.visible')
      cy.contains(reuses[1].title).should('be.visible')
    })

    it('should display empty state when no reuses', () => {
      cy.visit(`/indicators/${indicator.id}`)
      cy.contains('Réutilisations et API').click()
      cy.contains(
        "Il n'y a pas encore de réutilisation pour cet indicateur."
      ).should('be.visible')
    })
  })

  describe('No Datavisualisation Configured', () => {
    it('should not display the previsualisation', () => {
      cy.visit(`/indicators/${indicator.id}`)
      cy.contains('Prévisualisation').should('not.be.visible')
    })
  })

  describe('Prévisualisation Tab', () => {
    it('should display the previsualisation when enabled', () => {
      const indicatorWithViz = createIndicator(
        {},
        { enable_visualization: true }
      )
      const vizResource = createIndicatorResource()
      cy.mockDatasetAndRelatedObjects(indicatorWithViz, [vizResource])
      cy.intercept(
        'GET',
        `https://tabular-api*.data.gouv.fr/api/resources/${vizResource.id}/data/**`,
        {
          statusCode: 200,
          body: {
            data: []
          }
        }
      ).as(`tabular_api`)
      cy.visit(`/indicators/${indicatorWithViz.id}`)
      cy.contains('Prévisualisation').click()
      // Check if the visualization element appears
      cy.get('.indicator-viz').should('be.visible')
    })
  })
})
