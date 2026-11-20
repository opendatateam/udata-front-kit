import type { DatasetV2 } from '@datagouv/components-next'
import { datasetFactory } from 'cypress/support/factories/datasets_factory'

describe('Dataset Page - Status badge', () => {
  const visit = (dataset: DatasetV2) => {
    cy.mockDatasetAndRelatedObjects(dataset)
    cy.visit(`/datasets/${dataset.id}`)
    cy.wait(`@get_datasets_${dataset.id}`)
    cy.get('h1').should('contain', dataset.title)
  }

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
  })

  it('should display the "Archivé" badge for an archived dataset', () => {
    visit(datasetFactory.one({ overrides: { archived: true } }))

    cy.contains('.fr-badge', 'Archivé').should('be.visible')
  })

  it('should not display a status badge for a public dataset', () => {
    visit(datasetFactory.one())

    cy.contains('.fr-badge', 'Archivé').should('not.exist')
    cy.contains('.fr-badge', 'Brouillon').should('not.exist')
    cy.contains('.fr-badge', 'Supprimé').should('not.exist')
  })
})

describe('Dataset Page - DOI', () => {
  const DOI = '10.1234/abcd'

  const visitInformations = (dataset: DatasetV2) => {
    cy.mockDatasetAndRelatedObjects(dataset)
    cy.visit(`/datasets/${dataset.id}`)
    cy.wait(`@get_datasets_${dataset.id}`)
    cy.contains('button', 'Informations').click()
  }

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
  })

  it('should display the dataset DOI', () => {
    const dataset = datasetFactory.one({
      overrides: { doi: DOI }
    })
    visitInformations(dataset)

    cy.contains('a', DOI).should('have.attr', 'href', `https://doi.org/${DOI}`)
    cy.contains('button', 'Copier le DOI').should('exist')
  })

  it('should display the DOI from the harvest source', () => {
    const dataset = datasetFactory.one({
      overrides: { harvest: { doi: DOI } }
    })
    visitInformations(dataset)

    cy.contains('a', DOI).should('have.attr', 'href', `https://doi.org/${DOI}`)
  })

  it('should prefer the data.gouv.fr DOI over the harvest source one', () => {
    const sourceDoi = '10.1234/source'
    const dataset = datasetFactory.one({
      overrides: { doi: DOI, harvest: { doi: sourceDoi } }
    })
    visitInformations(dataset)

    cy.contains('a', DOI).should('have.attr', 'href', `https://doi.org/${DOI}`)
    cy.contains(sourceDoi).should('not.exist')
  })

  it('should link to data.gouv.fr to request a DOI', () => {
    const dataset = datasetFactory.one()
    visitInformations(dataset)

    cy.contains("Ce jeu de données n'a pas de DOI.").should('be.visible')
    cy.contains('a', 'Demander un DOI sur data.gouv.fr').should(
      'have.attr',
      'href',
      `${dataset.page}/informations`
    )
  })

  it('should not display the DOI block for a private dataset', () => {
    const dataset = datasetFactory.one({ overrides: { private: true } })
    visitInformations(dataset)

    cy.contains('dt', 'Identifiant').should('be.visible')
    cy.contains('dt', 'DOI').should('not.exist')
  })
})
