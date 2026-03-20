import type { Topic } from '@/model/topic'
import { topicFactory } from 'cypress/support/factories/topics_factory'

describe('Topics - List Page', () => {
  let testTopics: Topic[]
  const universeTag =
    Cypress.env('siteConfig').pages.bouquets.universe_query.tag
  const universeTagRegex = new RegExp(`[?&]tag=${universeTag}(?:&|$)`)

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    cy.mockSpatialLevels()
    cy.mockSpatialZone()
    cy.mockSpatialZonesSuggest()
    cy.mockUniverseOrganizations()
    testTopics = topicFactory.many(3)
    cy.mockDatagouvObjectList('topics', testTopics)
  })

  describe('List Display', () => {
    it('should display the list of topics', () => {
      cy.visit('/bouquets')
      cy.wait('@get_topics_list').then((interception) => {
        // Verify the API call includes the universe query tag
        expect(interception.request.url).to.match(universeTagRegex)
      })

      // Check that all topics are displayed
      testTopics.forEach((topic) => {
        cy.contains(topic.name).should('be.visible')
      })
    })

    it('should filter by organization when ADEME is selected', () => {
      cy.visit('/bouquets')

      // Wait for the initial API calls to complete
      cy.wait('@get_topics_list')
      cy.wait('@get_universe_organizations')

      // Click on the multiselect to open the dropdown
      cy.contains('label.fr-label', 'Organisation')
        .parent('.fr-select-group')
        .within(() => {
          cy.get('.multiselect-wrapper').click()
        })

      // Select ADEME from the dropdown options
      cy.get('.multiselect-option[aria-label="ADEME"]').click()

      // Verify the URL contains the organization parameter
      cy.url().should('include', 'organization=534fff4ca3a7292c64a77c95')

      // Wait for the filtered API call and verify parameters
      cy.wait('@get_topics_list').then((interception) => {
        expect(interception.request.url).to.match(
          /[?&]organization=534fff4ca3a7292c64a77c95(?:&|$)/
        )
        expect(interception.request.url).to.match(universeTagRegex)
      })
    })

    it('should filter by theme when a theme is selected', () => {
      cy.visit('/bouquets')

      // Wait for the initial API calls to complete
      cy.wait('@get_topics_list')

      // Click on the theme select to open the dropdown
      cy.contains('label.fr-label', 'Thématique')
        .parent('.fr-select-group')
        .within(() => {
          cy.get('.multiselect-wrapper').click()
        })

      // Select "Mieux consommer" from the dropdown options
      cy.get('.multiselect-option[aria-label="Mieux consommer"]').click()

      // Verify the URL contains the theme parameter
      cy.url().should('include', 'theme=mieux-consommer')

      // Wait for the filtered API call and verify parameters
      cy.wait('@get_topics_list').then((interception) => {
        expect(interception.request.url).to.match(
          /[?&]tag=ecospheres-theme-mieux-consommer(?:&|$)/
        )
        expect(interception.request.url).to.match(universeTagRegex)
      })
    })
  })

  describe('Segmented view control', () => {
    it('should not be visible to disconnected users', () => {
      cy.visit('/bouquets')
      cy.wait('@get_topics_list')

      cy.contains('Publiés').should('not.exist')
      cy.contains('Brouillons').should('not.exist')
    })

    it('should be visible to connected users', () => {
      cy.simulateConnectedUser({
        id: 'test-user-id',
        first_name: 'Test',
        last_name: 'User'
      })

      cy.visit('/bouquets')
      cy.wait('@get_topics_list')

      cy.contains('Publiés').should('be.visible')
      cy.contains('Brouillons').should('be.visible')
    })

    it('should send private=false to the API in published mode', () => {
      cy.simulateConnectedUser({
        id: 'test-user-id',
        first_name: 'Test',
        last_name: 'User'
      })

      cy.visit('/bouquets')
      cy.wait('@get_topics_list').then((interception) => {
        expect(interception.request.url).to.match(/[?&]private=false(?:&|$)/)
      })
    })

    it('should send private=true to the API after clicking "Brouillons"', () => {
      cy.simulateConnectedUser({
        id: 'test-user-id',
        first_name: 'Test',
        last_name: 'User'
      })

      cy.visit('/bouquets')
      cy.wait('@get_topics_list')

      cy.contains('Brouillons').click()

      cy.wait('@get_topics_list').then((interception) => {
        expect(interception.request.url).to.match(/[?&]private=true(?:&|$)/)
      })
    })
  })
})
