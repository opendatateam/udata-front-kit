declare namespace Cypress {
  interface Chainable {
    mockMatomo(): Chainable<void>
    mockStaticDatagouv(): Chainable<void>
    simulateConnectedUser(userData?: object): Chainable<void>
    mockDatagouvObject(resourceName: string, resourceId: string, data?: object): Chainable<void>
    mockDatagouvObjectList(resourceName: string, data?: object[]): Chainable<void>
  }
}
