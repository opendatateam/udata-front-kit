import { build, sequence } from 'mimicry-js'

import type { Activity } from '@/model/activity'
import type { DataserviceWithRel } from '@/model/dataservice'
import type { Resource } from '@/model/resource'
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
    },
    topic_reference: {
      overrides: {
        extras: {
          ['ecospheres' as SiteId]: {
            uri: sequence((x) => {
              const canonicalUrl =
                Cypress.env('siteConfig').website.meta.canonical_url ||
                'https://demo.ecologie.data.gouv.fr'
              return `${canonicalUrl}/bouquets/referenced-topic-${x}`
            }),
            availability: Availability.LOCAL_AVAILABLE,
            group: 'Test Group'
          }
        },
        element: null
      }
    },
    dataservice_reference_ecologie: {
      overrides: {
        extras: {
          ['ecospheres' as SiteId]: {
            uri: sequence((x) => {
              const canonicalUrl =
                Cypress.env('siteConfig').website.meta.canonical_url
              return `${canonicalUrl}/dataservices/referenced-dataservice-${x}`
            }),
            availability: Availability.LOCAL_AVAILABLE,
            group: 'Test Group'
          }
        },
        element: null
      }
    },
    dataservice_reference_datagouvfr: {
      overrides: {
        extras: {
          ['ecospheres' as SiteId]: {
            uri: sequence((x) => {
              const canonicalUrl = Cypress.env('siteConfig').datagouvfr.base_url
              return `${canonicalUrl}/dataservices/referenced-dataservice-${x}`
            }),
            availability: Availability.LOCAL_AVAILABLE,
            group: 'Test Group'
          }
        },
        element: null
      }
    },
    dataset_in_sequential_group: {
      overrides: {
        extras: {
          ['ecospheres' as SiteId]: {
            uri: sequence(
              (x) => `https://www.data.gouv.fr/datasets/dataset-factor-${x}`
            ),
            availability: Availability.LOCAL_AVAILABLE,
            group: sequence((x) => `Test Group ${x}`)
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

// Activity factory for testing
export const activityFactory = build<Activity>({
  fields: {
    key: 'topic:updated',
    label: 'Topic updated',
    actor: () => UserFactory.one(),
    created_at: () => new Date().toISOString(),
    organization: null,
    related_to: '',
    related_to_id: '',
    related_to_kind: 'Topic',
    related_to_url: '',
    icon: 'fr-icon-file-text-line',
    extras: {}
  },
  traits: {
    topic_created: {
      overrides: {
        key: 'topic:created',
        label: 'Topic created'
      }
    },
    topic_updated: {
      overrides: {
        key: 'topic:updated',
        label: 'Topic updated'
      }
    },
    element_created: {
      overrides: {
        key: 'topic:element:created',
        label: 'Element created',
        extras: {
          element_id: sequence((x) => `factor-${x}`)
        }
      }
    },
    element_updated: {
      overrides: {
        key: 'topic:element:updated',
        label: 'Element updated',
        extras: {
          element_id: sequence((x) => `factor-${x}`)
        }
      }
    },
    element_deleted: {
      overrides: {
        key: 'topic:element:deleted',
        label: 'Element deleted'
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

/**
 * Options for mocking topic and related objects
 */
export interface MockTopicOptions {
  /** Factor/elements associated with the topic */
  factors?: Factor[]
  /** Referenced topics (for topic_reference trait) */
  referencedTopics?: Topic[]
  /** Referenced dataservices (for dataservice_reference trait) */
  referencedDataservices?: DataserviceWithRel[]
  /** Activity history for the topic */
  activities?: Activity[]
  /** Dataset resources mapped by dataset ID */
  datasetResources?: Record<string, Resource[]>
}

/**
 * Common mocks for topic and discussions
 */
export function mockTopicAndRelatedObjects(
  topic: Topic,
  options: MockTopicOptions = {}
) {
  const {
    factors = [],
    referencedTopics = [],
    referencedDataservices = [],
    activities = [],
    datasetResources = {}
  } = options

  cy.mockDatagouvObject('topics', topic.slug, topic)
  factors.forEach((factor) => {
    if (factor.element?.class === 'Dataset') {
      const datasetId = factor.element.id
      const dataset = datasetFactory.one({ overrides: { id: datasetId } })
      cy.mockDatagouvObject('datasets', datasetId, dataset)

      // Mock resources for this dataset if provided
      const resources = datasetResources[datasetId] || []
      cy.mockResources(datasetId, resources)
    }
  })
  // Mock referenced topics for topic_reference trait
  referencedTopics.forEach((refTopic) => {
    cy.mockDatagouvObject('topics', refTopic.slug, refTopic)
  })
  // Mock referenced dataservices for dataservice_reference trait
  referencedDataservices.forEach((refDataservice) => {
    cy.mockDatagouvObject('dataservices', refDataservice.slug, refDataservice)

    // Mock the datasets list for this dataservice
    cy.intercept(
      'GET',
      new RegExp(`.*datasets.*dataservice=${refDataservice.id}`),
      {
        statusCode: 200,
        body: {
          data: [],
          total: 0,
          page: 1,
          page_size: 20,
          next_page: null,
          previous_page: null
        }
      }
    ).as(`getDataserviceDatasets_${refDataservice.id}`)
  })
  cy.mockDatagouvObjectList('discussions')
  cy.mockDatagouvObjectList('reuses')
  cy.mockDatagouvObjectList('activity', activities)

  // datasets related
  cy.mockResourceTypes()
}

// Helper to expand disclosure groups
export function expandDisclosureGroup(groupName = 'Test Group') {
  cy.contains('.disclosure__name', groupName)
    .closest('.disclosure__header')
    .find('.disclosure__trigger')
    .click()
}

// Combined setup for tests with existing factors
export function setupTopicWithExistingFactors(
  factors?: Factor[],
  activities: Activity[] = []
) {
  setupElementTest()

  const testFactors = factors || createTestFactors(2)
  const testTopic = createTestTopicWithElements(testFactors)

  mockTopicAndRelatedObjects(testTopic, { factors: testFactors, activities })

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

  mockTopicAndRelatedObjects(testTopic, {})
  // Set up element mocks for empty topic (all classes return empty arrays)
  mockTopicElementsByClass(testTopic.id, [], [], [])

  return { testTopic }
}

// Visit topic page - mocks should already be set up in setup functions
export function visitTopic(routeParam: string) {
  cy.visit(`/bouquets/${routeParam}`)
}
