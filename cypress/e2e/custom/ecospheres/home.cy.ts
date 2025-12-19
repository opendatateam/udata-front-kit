import type { Topic } from '@/model/topic'
import { topicFactory } from 'cypress/support/factories/topics_factory'

describe('Home Page Ecologie', () => {
  let testTopics: Topic[]

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    cy.mockSpatialLevels()
    testTopics = topicFactory.many(3)
    cy.mockDatagouvObjectList('topics', testTopics)
  })

  it('displays user first name and last name on homepage when connected', () => {
    cy.simulateConnectedUser({
      first_name: 'John',
      last_name: 'Doe'
    })

    cy.visit('/')

    cy.contains('John Doe').should('be.visible')
  })

  describe('Search Dropdown Options', () => {
    it('should display correct options in mega dropdown search', () => {
      cy.visit('/')

      // Click on the multiselect component itself to open dropdown
      cy.get('#big-select-search').click()

      // Verify the dropdown options are visible
      cy.get('.multiselect-dropdown:visible')
        .first()
        .within(() => {
          cy.contains('dans les jeux de données').should('be.visible')
          cy.contains('dans les bouquets').should('be.visible')
          cy.contains('dans les indicateurs').should('be.visible')
          cy.contains('dans les API').should('be.visible')
        })
    })

    it('should display correct options in header search', () => {
      cy.visit('/')

      // Find the header search input
      cy.get('header input[type="text"]').first().should('be.visible').click()

      // Verify the dropdown options are visible
      cy.get('.multiselect-dropdown:visible')
        .first()
        .within(() => {
          cy.contains('dans les jeux de données').should('be.visible')
          cy.contains('dans les bouquets').should('be.visible')
          cy.contains('dans les indicateurs').should('be.visible')
          cy.contains('dans les API').should('be.visible')
        })
    })
  })

  describe('Bouquets Cards Display', () => {
    it('should display bouquet cards in the discover section', () => {
      cy.visit('/')

      // Verify the "Les bouquets à découvrir" section is present
      cy.contains('h2', 'Les bouquets à découvrir').should('be.visible')

      // Verify that bouquet cards are displayed
      testTopics.forEach((topic) => {
        cy.contains(topic.name).should('be.visible')
      })

      // Verify "Voir les bouquets" link is present
      cy.contains('a', 'Voir les bouquets').should('be.visible')
    })

    it('should navigate to bouquet detail page when clicking on a card', () => {
      cy.visit('/')

      const firstTopic = testTopics[0]

      // Click on the first bouquet card title
      cy.contains('a', firstTopic.name).click()

      // Verify navigation to the bouquet detail page
      cy.url().should('include', `/bouquets/${firstTopic.slug}`)
    })
  })
})
