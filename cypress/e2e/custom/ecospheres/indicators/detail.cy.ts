import type { Indicator } from '@/custom/ecospheres/model/indicator'
import { createIndicator } from './support'

describe('Indicator Detail View', () => {
  let indicator: Indicator

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()

    // Create a mock indicator
    indicator = createIndicator()

    // Mock the API call to get the indicator
    cy.mockDatagouvObject('datasets', indicator.id, indicator)

    // Mock common data.gouv.fr APIs
    cy.mockSpatialLevels()
    cy.mockDatasetLicenses()
    cy.mockResourceTypes()
    cy.mockDatasetFrequencies()
    cy.mockSpatialGranularities()
    cy.mockDatagouvObjectList('discussions', [])
    cy.mockDatagouvObjectList('reuses', [])
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

  describe('Custom Metadata', () => {
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

    it('should display the maille minimale', () => {
      cy.visit(`/indicators/${indicator.id}`)
      cy.contains('Maille minimale').should('be.visible')
      cy.contains('Région française').should('be.visible')
    })

    it('should display the unité', () => {
      cy.visit(`/indicators/${indicator.id}`)
      cy.contains('Unité').should('be.visible')
      cy.contains('kg CO2').should('be.visible')
    })
  })
})
