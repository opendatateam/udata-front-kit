import {
  createTestTopic,
  mockTopicAndRelatedObjects,
  mockTopicElementsByClass,
  setupElementTest,
  visitTopic
} from './support'

describe('Topic detail page meta', () => {
  beforeEach(() => {
    setupElementTest()
  })

  it('should set window title with topic name', () => {
    const topic = createTestTopic({ name: 'Test Topic Name' })
    mockTopicAndRelatedObjects(topic)
    mockTopicElementsByClass(topic.id, [], [], [])
    visitTopic(topic.slug)

    const { pages, website } = Cypress.env('siteConfig')
    const singular = pages.bouquets.labels.singular
    const capitalizedSingular =
      singular.charAt(0).toUpperCase() + singular.slice(1)
    cy.title().should(
      'eq',
      `${capitalizedSingular} - Test Topic Name | ${website.title}`
    )
  })

  it('should announce page title in live region', () => {
    const topic = createTestTopic({ name: 'Test Topic Name' })
    mockTopicAndRelatedObjects(topic)
    mockTopicElementsByClass(topic.id, [], [], [])
    visitTopic(topic.slug)

    const { pages, website } = Cypress.env('siteConfig')
    const singular = pages.bouquets.labels.singular
    const capitalizedSingular =
      singular.charAt(0).toUpperCase() + singular.slice(1)
    cy.get('[aria-live="assertive"]')
      .find('li')
      .first()
      .should(
        'have.text',
        `Page ${capitalizedSingular} - Test Topic Name | ${website.title}`
      )
  })

  describe('global metas from index.html', () => {
    it('should have global robots meta from config', () => {
      const topic = createTestTopic()
      mockTopicAndRelatedObjects(topic)
      mockTopicElementsByClass(topic.id, [], [], [])

      visitTopic(topic.slug)

      const expectedRobots = Cypress.env('siteConfig').website.seo?.meta?.robots
      cy.get('head meta[name="robots"]').should(
        'have.attr',
        'content',
        expectedRobots
      )
    })

    it('should have global title from config', () => {
      const topic = createTestTopic()
      mockTopicAndRelatedObjects(topic)
      mockTopicElementsByClass(topic.id, [], [], [])

      visitTopic(topic.slug)

      const siteTitle = Cypress.env('siteConfig').website.title
      cy.title().should('contain', siteTitle)
    })
  })

  describe('component metas from TopicDetailView', () => {
    it('should have og:title and (og:)description with topic data', () => {
      const topic = createTestTopic({
        name: 'Test Topic Name',
        description: 'This is a test topic description'
      })
      mockTopicAndRelatedObjects(topic)
      mockTopicElementsByClass(topic.id, [], [], [])

      visitTopic(topic.slug)

      const siteTitle = Cypress.env('siteConfig').website.title
      cy.get('head meta[property="og:title"]').should(
        'have.attr',
        'content',
        `Collection - Test Topic Name | ${siteTitle}`
      )
      cy.get('head meta[property="og:description"]').should(
        'have.attr',
        'content',
        'This is a test topic description'
      )
      cy.get('head meta[name="description"]').should(
        'have.attr',
        'content',
        'This is a test topic description'
      )
    })

    it('should have canonical link with topic slug', () => {
      const topic = createTestTopic({ slug: 'my-test-topic' })
      mockTopicAndRelatedObjects(topic)
      mockTopicElementsByClass(topic.id, [], [], [])

      visitTopic(topic.slug)

      cy.get('head link[rel="canonical"]').should(($link) => {
        const href = $link.attr('href')
        expect(href).to.include('/bouquets/my-test-topic')
      })
    })

    it('should have noindex meta when topic is a draft', () => {
      const draftTopic = createTestTopic({ private: true })
      mockTopicAndRelatedObjects(draftTopic)
      mockTopicElementsByClass(draftTopic.id, [], [], [])

      visitTopic(draftTopic.slug)

      cy.get('head meta[name="robots"][content="noindex, nofollow"]').should(
        'exist'
      )
    })

    it('should have the global index meta when topic is public', () => {
      const publicTopic = createTestTopic({ private: false })
      mockTopicAndRelatedObjects(publicTopic)
      mockTopicElementsByClass(publicTopic.id, [], [], [])

      visitTopic(publicTopic.slug)

      const expectedRobots = Cypress.env('siteConfig').website.seo?.meta?.robots
      cy.get(`head meta[name="robots"][content="${expectedRobots}"]`).should(
        'exist'
      )
    })
  })
})

describe('Topic list page meta', () => {
  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    cy.mockSpatialLevels()
    cy.mockSpatialZone()
    cy.mockSpatialZonesSuggest()
    cy.mockListApis('topics', [])
    cy.visit('/bouquets')
  })

  it('should set window title from page meta config', () => {
    const { pages, website } = Cypress.env('siteConfig')
    const title = pages.bouquets.meta?.title
    cy.title().should('eq', `${title} | ${website.title}`)
  })

  it('should announce page title in live region', () => {
    const { pages, website } = Cypress.env('siteConfig')
    const title = pages.bouquets.meta?.title
    cy.get('[aria-live="assertive"]')
      .find('li')
      .first()
      .should('have.text', `Page ${title} | ${website.title}`)
  })
})
