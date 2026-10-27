const SURVEY = Cypress.env('siteConfig').website.survey
const DELAY_MS = (SURVEY?.delay ?? 180) * 1000
const DISMISSED_KEY = 'survey_dismissed_at'

describe('Survey modal', () => {
  beforeEach(function () {
    if (!SURVEY?.display || !SURVEY?.url) this.skip()
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    cy.mockSpatialLevels()
    cy.mockDatagouvObjectList('topics', [])
  })

  const visitAndWait = () => {
    cy.clock()
    cy.visit('/')
    cy.tick(DELAY_MS)
  }

  it('opens after the configured delay, not before', () => {
    cy.clock()
    cy.visit('/')
    cy.tick(DELAY_MS - 1000)
    cy.contains(SURVEY.title).should('not.exist')
    cy.tick(1000)
    cy.contains(SURVEY.title).should('be.visible')
    cy.contains('a', SURVEY.button_label)
      .should('have.attr', 'href', SURVEY.url)
      .and('have.attr', 'target', '_blank')
  })

  it('shows again on next visit when "Ne plus afficher" is not checked', () => {
    visitAndWait()
    cy.contains('button', 'Non merci').click()
    cy.contains(SURVEY.title).should('not.exist')
    cy.window().then((win) => {
      expect(win.localStorage.getItem(DISMISSED_KEY)).to.equal(null)
    })

    visitAndWait()
    cy.contains(SURVEY.title).should('be.visible')
  })

  it('does not show again when "Ne plus afficher" is checked', () => {
    visitAndWait()
    cy.contains('label', 'Ne plus afficher ce message').click()
    cy.contains('button', 'Non merci').click()
    cy.window().then((win) => {
      expect(win.localStorage.getItem(DISMISSED_KEY)).to.not.equal(null)
    })

    visitAndWait()
    cy.contains(SURVEY.title).should('not.exist')
  })
})
