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
          cy.contains('dans les collections thématiques').should('be.visible')
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
          cy.contains('dans les collections thématiques').should('be.visible')
          cy.contains('dans les indicateurs').should('be.visible')
          cy.contains('dans les API').should('be.visible')
        })
    })
  })

  describe('Collections thématiques Cards Display', () => {
    it('should display collection cards in the discover section', () => {
      cy.visit('/')

      // Verify the "Collections thématiques" section is present
      cy.contains('h2', 'Collections thématiques').should('be.visible')

      // Verify that collection cards are displayed
      testTopics.forEach((topic) => {
        cy.contains(topic.name).should('be.visible')
      })

      // Verify link to all collections is present
      cy.contains('a', 'Collections thématiques').should('be.visible')
    })

    it('should navigate to collection thématique detail page when clicking on a card', () => {
      cy.visit('/')

      const firstTopic = testTopics[0]

      // Click on the first collection card title
      cy.contains('a', firstTopic.name).click()

      // Verify navigation to the collection thématique detail page
      cy.url().should('include', `/bouquets/${firstTopic.slug}`)
    })
  })
})
