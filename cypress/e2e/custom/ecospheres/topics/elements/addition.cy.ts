import type { Topic } from '@/model/topic'
import { datasetFactory } from 'cypress/support/factories/datasets_factory'
import { factorFactory, setupEmptyTopic, visitTopic } from '../support'

describe('Topic Elements - Factor Addition', () => {
  let testTopic: Topic

  beforeEach(() => {
    ;({ testTopic } = setupEmptyTopic())
  })

  describe('Adding New Factors', () => {
    beforeEach(() => {
      visitTopic(testTopic.slug)
    })

    it('should add a new "missing" factor and be able to edit it immediately', () => {
      // this factor will be used both as form values and response payload
      // it's a "missing" factor without group
      const testFactor = factorFactory.one()

      // Create a factor with an ID that simulates what the server would return
      const remoteFactor = {
        ...testFactor,
        id: 'server-generated-id-123'
      }

      // Mock the POST request for creating elements (now returns array of created elements with IDs)
      cy.intercept('POST', `**/topics/${testTopic.id}/elements/`, {
        statusCode: 201,
        body: [remoteFactor]
      }).as('createElement')

      // Step 1: Add a new factor
      cy.get('.test__add_dataset_btn').click()

      // Fill in the factor form
      cy.get('#input-title').type(testFactor.title)
      cy.get('#input-purpose').type(
        testFactor.description || 'test description'
      )

      // Select data source availability option by clicking the label associated with the radio button
      cy.get(`input[name="source"][value="missing"]`).then(($input) => {
        const labelId = $input.attr('id')
        cy.get(`label[for="${labelId}"]`).click()
      })

      // Submit the form
      cy.get('.test__submit_modal_btn').click()

      // Verify API call was made with correct structure
      cy.wait('@createElement').then((interception) => {
        expect(interception.request.body).to.be.an('array')
        expect(interception.request.body).to.have.length(1)
        expect(interception.request.body[0]).to.include({
          title: testFactor.title,
          description: testFactor.description
        })
      })

      // Verify the factor appears in the list (should be immediate since it's added locally)
      cy.contains(testFactor.title).should('be.visible')

      // Step 2: Edit the newly added factor (makes sure the local element is viable)
      const updatedFactor = {
        ...remoteFactor,
        title: 'Updated Title After Creation',
        description: 'Updated description after creation'
      }

      // Mock the PUT request for updating the element
      cy.intercept(
        'PUT',
        `**/topics/${testTopic.id}/elements/${remoteFactor.id}`,
        {
          statusCode: 200,
          body: updatedFactor
        }
      ).as('updateElement')

      // Click the edit button for the newly added factor
      cy.contains(testFactor.title)
        .closest('li')
        .within(() => {
          cy.get('.test__edit_factor_btn').click()
        })

      // Update the form fields
      cy.get('#input-title').clear().type(updatedFactor.title)
      cy.get('#input-purpose').clear().type(updatedFactor.description)

      // Submit the form
      cy.get('.test__submit_modal_btn').click()

      // This should succeed now that the local element has the correct ID from the server
      cy.wait('@updateElement').then((interception) => {
        expect(interception.request.body).to.include({
          title: updatedFactor.title,
          description: updatedFactor.description
        })
      })

      // Verify the updated factor appears in the DOM
      cy.contains(updatedFactor.title).should('be.visible')
      cy.contains(testFactor.title).should('not.exist')
    })

    it('should allow submission without description', () => {
      const testFactor = factorFactory.one()
      const remoteFactor = { ...testFactor, id: 'server-generated-id-456' }

      cy.intercept('POST', `**/topics/${testTopic.id}/elements/`, {
        statusCode: 201,
        body: [remoteFactor]
      }).as('createElement')

      cy.get('.test__add_dataset_btn').click()

      cy.get('#input-title').type(testFactor.title)

      cy.get(`input[name="source"][value="missing"]`).then(($input) => {
        const labelId = $input.attr('id')
        cy.get(`label[for="${labelId}"]`).click()
      })

      // Submit without filling description
      cy.get('.test__submit_modal_btn').click()

      cy.wait('@createElement').then((interception) => {
        expect(interception.request.body[0]).to.include({
          title: testFactor.title
        })
      })

      cy.contains(testFactor.title).should('be.visible')
    })

    it('should pre-fill the title when a dataset is selected and the title is empty', () => {
      const searchDataset = datasetFactory.one({
        overrides: { title: 'Pre-filled Dataset Title' }
      })

      cy.intercept('GET', /.*data\.gouv\.fr\/api\/\d\/datasets\/search.*/, {
        statusCode: 200,
        body: {
          data: [searchDataset],
          total: 1,
          page: 1,
          page_size: 10,
          next_page: null,
          previous_page: null
        }
      }).as('searchDatasets')

      cy.get('.test__add_dataset_btn').click()

      // Type in the dataset search input (min 3 chars to trigger search)
      cy.get('#input-dataset').type('Pre-filled')
      cy.wait('@searchDatasets')

      // Select the first result
      cy.get('.multiselect-option').first().click()

      // Title should be pre-filled with the dataset title
      cy.get('#input-title').should('have.value', searchDataset.title)
    })

    it('should not pre-fill the title when a dataset is selected but the title is already set', () => {
      const searchDataset = datasetFactory.one({
        overrides: { title: 'Dataset Title From Search' }
      })

      cy.intercept('GET', /.*data\.gouv\.fr\/api\/\d\/datasets\/search.*/, {
        statusCode: 200,
        body: {
          data: [searchDataset],
          total: 1,
          page: 1,
          page_size: 10,
          next_page: null,
          previous_page: null
        }
      }).as('searchDatasets')

      cy.get('.test__add_dataset_btn').click()

      // Set the title first
      cy.get('#input-title').type('My custom title')

      // Select a dataset
      cy.get('#input-dataset').type('Dataset')
      cy.wait('@searchDatasets')
      cy.get('.multiselect-option').first().click()

      // Title should remain unchanged
      cy.get('#input-title').should('have.value', 'My custom title')
    })
  })
})
