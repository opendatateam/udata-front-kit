declare namespace Cypress {
  interface Chainable {
    checkRGAAContrast(): Chainable<void>
    isInViewport(options?: { threshold?: number; wait?: number }): Chainable<Element>
    mockDatasetAndRelatedObjects(dataset: object, resources?: Array): Chainable<void>
    mockDatasetBadges(): Chainable<void>
    mockDatasetFrequencies(): Chainable<void>
    mockDatasetLicenses(): Chainable<void>
    mockDatagouvObject(resourceName: string, resourceId: string, data?: object): Chainable<void>
    mockDatagouvObjectList(resourceName: string, data?: object[]): Chainable<void>
    mockMatomo(): Chainable<void>
    mockMetricsApi(datasetId: string): Chainable<void>
    mockResources(datasetId: string, data?: Array): Chainable<void>
    mockResourceTypes(): Chainable<void>
    mockSpatialGranularities(): Chainable<void>
    mockSpatialLevels(): Chainable<void>
    mockSpatialZone(): Chainable<void>
    mockSpatialZonesSuggest(): Chainable<void>
    mockStaticDatagouv(): Chainable<void>
    simulateConnectedUser(userData?: object): Chainable<void>
    simulateDisconnectedUser(): Chainable<void>
  }
}
