/**
 * Custom command to select an option in a SearchableSelect component (Headless UI Combobox).
 * @param {string} selectLabel - The label text of the select component (e.g., "Organisation")
 * @param {string} optionLabel - The label/text of the option to select (e.g., "ADEME")
 */
Cypress.Commands.add('selectFilterValue', (selectLabel, optionLabel) => {
  cy.contains('label.fr-label', selectLabel)
    .closest('.fr-input-group')
    .within(() => {
      // Click the combobox open button (covers the full input area when closed)
      cy.get('[data-testid^="searchable-select-"]').click()
      // Click the matching option in the dropdown
      cy.contains('li', optionLabel).click()
    })
})

Cypress.Commands.add('clickCheckbox', (checkbox_name) => {
  cy.get(`input[name="${checkbox_name}"]`)
    .invoke('attr', 'id')
    .then((inputId) => {
      cy.get(`label[for="${inputId}"]`).click()
    })
})

Cypress.Commands.add(
  'expectActionToCallApi',
  (action, resourceName, expectedParams) => {
    // Order-independent URL param matching: { tag: ['a', 'b'], q: 'foo' }
    const matches = (url) => {
      const params = new URL(url).searchParams
      return Object.entries(expectedParams).every(([key, value]) => {
        const actual = params.getAll(key)
        const expected = Array.isArray(value) ? value : [value]
        return expected.every((v) => actual.includes(v))
      })
    }

    const alias = `@get_${resourceName}_list`

    // Drain one initial call (page load), then trigger the action.
    cy.wait(alias)
    action()

    // Pages with multiple search types (e.g. simplifions) fire one request per
    // type, so several calls may be queued. Walk through them until we find one
    // that satisfies the expected params.
    const findMatch = (attemptsLeft) => {
      cy.wait(alias).then((interception) => {
        if (matches(interception.request.url)) return
        if (attemptsLeft > 0) findMatch(attemptsLeft - 1)
        else cy.wrap(interception.request.url).should('satisfy', matches)
      })
    }
    findMatch(3)
  }
)
