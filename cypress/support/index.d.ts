declare namespace Cypress {
  interface Chainable {
    checkRGAAContrast(): Chainable<void>
    mockDatasetFrequencies(): Chainable<void>
    mockDatasetLicenses(): Chainable<void>
    mockDatagouvObject(resourceName: string, resourceId: string, data?: object): Chainable<void>
    mockDatagouvObjectList(resourceName: string, data?: object[]): Chainable<void>
    mockMatomo(): Chainable<void>
    mockResourceTypes(): Chainable<void>
    mockSpatialGranularities(): Chainable<void>
    mockSpatialLevels(): Chainable<void>
    mockStaticDatagouv(): Chainable<void>
    simulateConnectedUser(userData?: object): Chainable<void>
    simulateDisconnectedUser(): Chainable<void>
  }
}
