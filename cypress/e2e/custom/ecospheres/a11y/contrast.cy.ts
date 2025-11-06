import type { DataserviceWithRel } from '@/model/dataservice'
import type { Topic } from '@/model/topic'
import type { DatasetV2 } from '@datagouv/components-next'
import { dataserviceFactory } from 'cypress/support/factories/dataservices_factory'
import { datasetFactory } from 'cypress/support/factories/datasets_factory'
import { topicFactory } from 'cypress/support/factories/topics_factory'
import { mockUniverseOrganizations } from '../mocks'

describe('a11y contrast testing', () => {
  let testTopics: Topic[]
  let testDatasets: DatasetV2[]
  let testDataservices: DataserviceWithRel[]

  beforeEach(() => {
    // global mocks
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    cy.mockSpatialLevels()
    mockUniverseOrganizations()
    // mock topics
    testTopics = topicFactory.many(3)
    cy.mockDatagouvObjectList('topics', testTopics)
    // mock datasets
    testDatasets = datasetFactory.many(3)
    cy.mockDatagouvObjectList('datasets', testDatasets)
    // mock dataservices
    testDataservices = dataserviceFactory.many(3)
    // Mock the API response
    cy.mockDatagouvObjectList('dataservices', testDataservices)
  })

  const pages = {
    '/': '#main-content',
    '/datasets': 'ul.fr-grid-row > li',
    '/dataservices': 'ul.fr-grid-row > li',
    '/bouquets': 'ul.fr-grid-row > li',
    '/indicators': 'ul.fr-grid-row > li'
  }

  const testContrast = (path: string, selector: string) => {
    cy.visit(path)
    cy.get(selector).should('be.visible')
    // check that loader has gone away
    cy.get('.vl-overlay').should('not.exist')
    cy.injectAxe()
    cy.checkRGAAContrast()
  }

  const userStates = [
    { name: 'connected', setup: () => cy.simulateConnectedUser() },
    { name: 'disconnected', setup: () => cy.simulateDisconnectedUser() }
  ]

  userStates.forEach(({ name, setup }) => {
    describe(`${name} user`, () => {
      beforeEach(setup)
      Object.entries(pages).forEach(([path, value]) => {
        it(`checks color contrast on ${path} page`, () => {
          testContrast(path, value)
        })
      })
    })
  })
})
