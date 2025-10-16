import { build, sequence } from 'mimicry-js'

import type { Factor, SiteId, Topic } from '@/model/topic'
import { Availability } from '@/model/topic'
import { datasetFactory } from 'cypress/support/factories/datasets_factory'
import { topicFactory } from 'cypress/support/factories/topics_factory'
import { UserFactory } from 'cypress/support/factories/users_factory'

// Factor/Element factory for testing
export const factorFactory = build<Factor>({
  fields: {
    id: sequence((x) => `factor-${x}`),
    title: sequence((x) => `Sample Factor Title ${x}`),
    description: 'Sample factor description for testing purposes',
    tags: [],
    extras: {
      ['ecospheres' as SiteId]: {
        uri: null,
        availability: Availability.MISSING
      }
    },
    element: null
  },
  traits: {
    missing_no_group: {},
    dataset_in_group: {
      overrides: {
        extras: {
          ['ecospheres' as SiteId]: {
            uri: sequence(
              (x) => `https://www.data.gouv.fr/datasets/dataset-factor-${x}`
            ),
            availability: Availability.LOCAL_AVAILABLE,
            group: 'Test Group'
          }
        },
        element: {
          class: 'Dataset',
          id: sequence((x) => `dataset-factor-${x}`)
        }
      }
    }
  }
})

// Create tests factors, datasets by default
export function createTestFactors(
  howMany: number = 2,
  traits: string[] = ['dataset_in_group']
) {
  return factorFactory.many(howMany, { traits })
}

// Create test topic with proper setup
export function createTestTopic(overrides = {}): Topic {
  // user owned Topic to faciliate permission tests
  const owner = UserFactory.one({
    overrides: {
      id: 'test-user-id',
      first_name: 'Test',
      last_name: 'User'
    }
  })
  return topicFactory.one({
    overrides: {
      organization: null,
      owner,
      ...overrides
    }
  })
}

// Create test topic that already has elements
export function createTestTopicWithElements(testFactors: Factor[]) {
  return createTestTopic({
    elements: {
      total: testFactors.length
    }
  })
}

// Common setup for element tests
export function setupElementTest() {
  cy.mockMatomo()
  cy.mockStaticDatagouv()

  // Simulate connected user with edit permissions
  cy.simulateConnectedUser({
    id: 'test-user-id',
    first_name: 'Test',
    last_name: 'User'
  })
}

// Mock all element classes for a topic
export function mockTopicElementsByClass(
  topicId: string,
  datasetElements: Factor[] = [],
  noneElements: Factor[] = [],
  reuseElements: Factor[] = []
) {
  cy.intercept(
    'GET',
    new RegExp(`.*topics/${topicId}/elements.*class=Dataset`),
    {
      statusCode: 200,
      body: {
        data: datasetElements,
        total: datasetElements.length,
        page: 1,
        page_size: 1000,
        next_page: null,
        previous_page: null
      }
    }
  ).as('getElementsDataset')

  cy.intercept('GET', new RegExp(`.*topics/${topicId}/elements.*class=None`), {
    statusCode: 200,
    body: {
      data: noneElements,
      total: noneElements.length,
      page: 1,
      page_size: 1000,
      next_page: null,
      previous_page: null
    }
  }).as('getElementsNone')

  cy.intercept('GET', new RegExp(`.*topics/${topicId}/elements.*class=Reuse`), {
    statusCode: 200,
    body: {
      data: reuseElements,
      total: reuseElements.length,
      page: 1,
      page_size: 1000,
      next_page: null,
      previous_page: null
    }
  }).as('getElementsReuse')
}

// Common mocks for topic and discussions
export function mockTopicAndRelatedObjects(
  topic: Topic,
  factors: Factor[] = []
) {
  cy.mockDatagouvObject('topics', topic.id, topic)
  factors.forEach((factor) => {
    if (factor.element?.class === 'Dataset') {
      cy.mockDatagouvObject(
        'datasets',
        factor.element.id,
        datasetFactory.one({ overrides: { id: factor.element.id } })
      )
    }
  })
  cy.mockDatagouvObjectList('discussions')
  cy.mockDatagouvObjectList('reuses')
  cy.mockDatagouvObjectList('activity')
}

// Helper to expand disclosure groups
export function expandDisclosureGroup(groupName = 'Test Group') {
  cy.contains('.disclosure__name', groupName)
    .closest('.disclosure__header')
    .find('.disclosure__trigger')
    .click()
}

// Combined setup for tests with existing factors
export function setupTopicWithExistingFactors(factors?: Factor[]) {
  setupElementTest()

  const testFactors = factors || createTestFactors(2, ['dataset_in_group'])
  const testTopic = createTestTopicWithElements(testFactors)

  mockTopicAndRelatedObjects(testTopic, testFactors)

  // Determine element class distribution based on factor traits
  const datasetFactors = testFactors.filter(
    (f) => f.element?.class === 'Dataset'
  )
  const noneFactors = testFactors.filter((f) => f.element === null)

  // Set up element mocks based on factor types
  mockTopicElementsByClass(testTopic.id, datasetFactors, noneFactors, [])

  return { testTopic, testFactors }
}

// Combined setup for tests starting with no factors (like addition)
export function setupEmptyTopic(): { testTopic: Topic } {
  setupElementTest()

  const testTopic = createTestTopic()

  mockTopicAndRelatedObjects(testTopic)
  // Set up element mocks for empty topic (all classes return empty arrays)
  mockTopicElementsByClass(testTopic.id, [], [], [])

  return { testTopic }
}

// Visit topic page - mocks should already be set up in setup functions
export function visitTopic(routeParam: string) {
  cy.visit(`/bouquets/${routeParam}`)
}
