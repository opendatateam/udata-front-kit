import type { Indicator } from '@/custom/ecospheres/model/indicator'
import type { Dataservice, Reuse } from '@datagouv/components-next'
import { dataserviceFactory } from 'cypress/support/factories/dataservices_factory'
import { resourceFactory } from 'cypress/support/factories/resources_factory'
import { reuseFactory } from 'cypress/support/factories/reuses_factory'
import { createIndicator } from './support'

describe('Indicator Detail View', () => {
  let indicator: Indicator

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    cy.mockSpatialLevels()

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

  describe('Tags display', () => {
    it('should display the secteur tag', () => {
      cy.visit(`/indicators/${indicator.id}`)
      cy.contains('Energie').should('be.visible')
    })

    it('should display the levier tag', () => {
      cy.visit(`/indicators/${indicator.id}`)
      cy.contains('Biogaz').should('be.visible')
    })
  })

  describe('Informations Tab', () => {
    beforeEach(() => {
      cy.visit(`/indicators/${indicator.id}`)
      cy.contains('Informations').click()
    })

    it('should display all metadata', () => {
      cy.get('#tab-content-infos').within(() => {
        // Couverture géographique
        cy.contains('Couverture géographique').should('be.visible')
        cy.contains('Île-de-France').should('be.visible')

        // Couverture temporelle
        cy.contains('Couverture temporelle').should('be.visible')
        cy.contains('2020 à 2022').should('be.visible')

        // Unité
        cy.contains('Unité').should('be.visible')
        cy.contains('kg CO2').should('be.visible')

        // Mailles
        cy.contains('Mailles').should('be.visible')
        cy.contains('Région française').should('be.visible')

        // Date de création
        cy.contains('dt', 'Date de création').parent().contains('2025')

        // Date de mise à jour
        cy.contains('dt', 'Date de mise à jour').parent().contains('2025')

        // Identifiant
        cy.contains('Identifiant').should('be.visible')
        cy.contains(indicator.id).should('be.visible')

        // Licence
        cy.contains('Licence').should('be.visible')
        cy.contains('Licence Ouverte / Open Licence').should('be.visible')

        // Fréquence de mise à jour
        cy.contains('Fréquence de mise à jour').should('be.visible')
        cy.contains('Annuelle').should('be.visible')

        // Prochaine mise à jour attendue (Q → T replacement)
        cy.contains('Prochaine mise à jour attendue').should('be.visible')
        cy.contains('T3 2025').should('be.visible')

        // Tags
        cy.contains('Mots-clés').should('be.visible')
        cy.contains('ecospheres-indicateurs-levier-biogaz').should('be.visible')

        // Mots-clés et extras
        cy.contains('Voir les extras').should('be.visible')
      })
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

  describe('Tab counts', () => {
    it('should show distinct counts on each tab', () => {
      const countsIndicator = createIndicator(
        {
          metrics: {
            discussions: 9,
            discussions_open: 0,
            reuses: 3,
            dataservices: 4,
            followers: 0,
            views: 0,
            resources_downloads: 0
          }
        },
        {
          sources: [
            {
              nom: 'Source 1',
              url: 'https://example.com/source1',
              description: 'Description de la source 1',
              producteur: 'Producteur 1',
              distributeur: 'Distributeur 1'
            },
            {
              nom: 'Source 2',
              url: 'https://example.com/source2',
              description: 'Description de la source 2',
              producteur: 'Producteur 2',
              distributeur: 'Distributeur 2'
            }
          ],
          enable_visualization: false
        }
      )
      cy.mockDatasetAndRelatedObjects(countsIndicator, resourceFactory.many(5))

      cy.visit(`/indicators/${countsIndicator.id}`)

      cy.contains('button', 'Fichiers (5)').should('be.visible')
      cy.contains('button', 'Sources (2)').should('be.visible')
      cy.contains('button', 'Réutilisations et API (7)').should('be.visible')
      cy.contains('button', 'Discussions (9)').should('be.visible')
      cy.contains('button', 'Informations').find('sup').should('not.exist')
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
})
