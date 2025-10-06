declare namespace Cypress {
  interface Chainable {
    mockDatagouvObject(resourceName: string, resourceId: string, data?: object): Chainable<void>
    mockDatagouvObjectList(resourceName: string, data?: object[]): Chainable<void>
    mockMatomo(): Chainable<void>
    mockStaticDatagouv(): Chainable<void>
    simulateConnectedUser(userData?: object): Chainable<void>
  }
}
