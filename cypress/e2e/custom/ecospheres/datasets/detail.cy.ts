import type { DatasetV2 } from '@datagouv/components-next'
import { datasetFactory } from 'cypress/support/factories/datasets_factory'
import { discussionFactory } from 'cypress/support/factories/discussions_factory'
import { resourceFactory } from 'cypress/support/factories/resources_factory'

const NETWORKS = Cypress.env('siteConfig').networks
const SIMM_TOPIC_ID: string =
  NETWORKS?.entries?.simm?.pages.datasets.universe_query.topic

describe('Dataset Detail View - Networks (univers)', () => {
  let dataset: DatasetV2

  // networks can be disabled per environment (e.g. prod)
  before(function () {
    if (!NETWORKS) this.skip()
  })

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    dataset = datasetFactory.one()
    cy.mockDatasetAndRelatedObjects(dataset)
  })

  it('displays the network block when the dataset belongs to a SIF network', () => {
    cy.mockDatasetNetworks(dataset.id, [
      {
        id: SIMM_TOPIC_ID,
        name: 'Univers SIMM',
        slug: 'univers-simm',
        tags: ['ecospheres', 'ecospheres-networks', 'simm']
      }
    ])

    cy.visit(`/datasets/${dataset.id}`)
    cy.wait(`@get_datasets_${dataset.id}`)
    cy.wait(`@get_dataset_networks_${dataset.id}`)

    cy.contains('dt', 'Réseau').should('be.visible')
    cy.contains('Milieu Marin France').should(
      'have.attr',
      'href',
      '/contributors/simm'
    )
  })

  it('does not display the network block when the dataset belongs to no network', () => {
    cy.visit(`/datasets/${dataset.id}`)
    cy.wait(`@get_datasets_${dataset.id}`)
    cy.wait(`@get_dataset_networks_${dataset.id}`)

    cy.contains('dt', 'Réseau').should('not.exist')
  })
})

describe('Dataset Page - Tab counts', () => {
  it('should show distinct counts on each tab', () => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()

    const testDataset = datasetFactory.one({
      overrides: {
        metrics: {
          discussions: 7,
          discussions_open: 0,
          reuses: 3,
          dataservices: 2,
          followers: 0,
          views: 0,
          resources_downloads: 0
        }
      }
    })

    cy.mockDatasetAndRelatedObjects(testDataset, resourceFactory.many(4))
    // Differs from metrics.discussions: the tab shows the loaded list's total
    cy.mockDatagouvObjectList('discussions', discussionFactory.many(2))

    cy.visit(`/datasets/${testDataset.id}`)
    cy.wait(`@get_datasets_${testDataset.id}`)

    cy.contains('button', 'Fichiers (4)').should('be.visible')
    cy.contains('button', 'Réutilisations et API (5)').should('be.visible')
    cy.contains('button', 'Discussions (2)').should('be.visible')
    cy.contains('button', 'Informations')
      .find('sup.tab-count')
      .should('not.exist')
  })
})

describe('Dataset Page - Keywords', () => {
  it('should link keywords to the local datasets list filtered by tag', () => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()

    const dataset = datasetFactory.one({
      overrides: { tags: ['climat', 'qualite-air'] }
    })
    cy.mockDatasetAndRelatedObjects(dataset)

    cy.visit(`/datasets/${dataset.id}`)
    cy.wait(`@get_datasets_${dataset.id}`)
    cy.contains('button', 'Informations').click()

    dataset.tags?.forEach((tag) => {
      cy.contains('a', tag).should('have.attr', 'href', `/datasets?tag=${tag}`)
    })
  })
})

describe('Dataset Page - Parent dataset', () => {
  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
  })

  it('should display a callout linking to the parent dataset', () => {
    const parent = datasetFactory.one({
      overrides: { title: 'Jeu de données parent de test' }
    })
    const child = datasetFactory.one({
      overrides: { extras: { dcat: { parent: parent.id } } }
    })
    cy.mockDatasetAndRelatedObjects(child)
    cy.mockDatagouvObject('datasets', parent.id, parent)

    cy.visit(`/datasets/${child.id}`)
    cy.wait(`@get_datasets_${parent.id}`)

    cy.get('.fr-callout')
      .contains('a', parent.title)
      .should('have.attr', 'href', `/datasets/${parent.slug}`)
  })

  it('should navigate to the parent dataset', () => {
    const parent = datasetFactory.one({
      overrides: { title: 'Jeu de données parent de test' }
    })
    const child = datasetFactory.one({
      overrides: { extras: { dcat: { parent: parent.id } } }
    })
    cy.mockDatasetAndRelatedObjects(child)
    cy.mockDatasetAndRelatedObjects(parent)

    cy.visit(`/datasets/${child.id}`)
    cy.get('.fr-callout').contains('a', parent.title).click()

    cy.location('pathname').should('eq', `/datasets/${parent.slug}`)
    cy.get('h1').should('contain', parent.title)
    cy.get('.fr-callout').should('not.exist')
  })

  it('should not display the callout without a parent dataset', () => {
    const dataset = datasetFactory.one()
    cy.mockDatasetAndRelatedObjects(dataset)

    cy.visit(`/datasets/${dataset.id}`)
    cy.wait(`@get_datasets_${dataset.id}`)

    cy.get('.fr-callout').should('not.exist')
  })
})
