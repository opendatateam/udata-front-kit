import { createTestPage } from './support'

describe('Ecospheres - CMS Page Public View', () => {
  const category = Cypress.env('siteConfig').website.cms.categories[0]

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
  })

  it('should render a published page tagged with the category', () => {
    const page = createTestPage({
      name: 'Nouvel indicateur disponible',
      slug: 'nouvel-indicateur',
      tags: [`cms-category:${category.id}`],
      published: new Date().toISOString(),
      // one of each simple bloc type, to smoke-test the rendering pipeline
      blocs: [
        {
          id: 'bloc-hero',
          class: 'HeroBloc',
          title: 'Un indicateur pour mieux comprendre',
          description: 'Suivez son évolution au fil des mois.',
          color: 'primary',
          main_link_title: 'En savoir plus',
          main_link_url: 'https://www.data.gouv.fr/'
        },
        {
          id: 'bloc-markdown',
          class: 'MarkdownBloc',
          title: 'Contexte',
          subtitle: null,
          content: 'Ce contenu est écrit en **Markdown**.'
        },
        {
          id: 'bloc-links',
          class: 'LinksListBloc',
          title: 'Ressources utiles',
          subtitle: null,
          paragraph: null,
          main_link_title: null,
          main_link_url: null,
          links: [
            {
              title: 'Documentation',
              url: 'https://www.data.gouv.fr/',
              color: null
            }
          ]
        }
      ]
    })
    cy.mockDatagouvObject('posts', page.slug, page)

    cy.visit(`${category.route_prefix}/${page.slug}`)

    cy.get('h1').should('contain.text', page.name)
    cy.title().should('include', page.name)

    cy.contains('h2', 'Un indicateur pour mieux comprendre').should(
      'be.visible'
    )
    cy.contains('En savoir plus').should('be.visible')
    cy.contains('h2', 'Contexte').should('be.visible')
    cy.contains('strong', 'Markdown').should('be.visible')
    cy.contains('h2', 'Ressources utiles').should('be.visible')
    cy.contains('a', 'Documentation').should(
      'have.attr',
      'href',
      'https://www.data.gouv.fr/'
    )
  })

  it('should 404 a page that does not carry the category tag', () => {
    const page = createTestPage({
      name: 'Page sans catégorie',
      slug: 'page-sans-categorie',
      tags: [],
      published: new Date().toISOString()
    })
    cy.mockDatagouvObject('posts', page.slug, page)

    cy.visit(`${category.route_prefix}/${page.slug}`)

    cy.contains('Page introuvable').should('be.visible')
  })
})
