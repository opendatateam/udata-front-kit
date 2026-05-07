declare namespace Cypress {
  interface Chainable {
    allowExternalRequests(): Chainable<void>
    baseMocksForSimplifions(): Chainable<void>
    catchUnmockedRequests(): Chainable<void>
    checkRGAAContrast(): Chainable<void>
    clickCheckbox(checkbox_name: string): Chainable<void>
    expectActionToCallApi(action: () => void, resourceName: string, expectedUrlParams: string | RegExp): Chainable<void>
    expectRequestWithParams(resourceName: string, requestParamsString: string | RegExp): Chainable<void>
    isInViewport(options?: { threshold?: number; wait?: number }): Chainable<Element>
    mockDatagouvObject(resourceName: string, resourceId: string, data?: object): Chainable<void>
    mockDatagouvObjectList(resourceName: string, data?: object[]): Chainable<void>
    mockDatagouvObjectListWithTags(resourceName: string, tags?: string[], data?: object[]): Chainable<void>
    mockDataserviceMetricsApi(dataserviceId: string): Chainable<void>
    mockDatasetAndRelatedObjects(dataset: object, resources?: Array<object>, dataservices?: Array<object>, reuses?: Array<object>): Chainable<void>
    mockDatasetBadges(): Chainable<void>
    mockDatasetFrequencies(): Chainable<void>
    mockDatasetLicenses(): Chainable<void>
    mockDatasetSchemas(): Chainable<void>
    mockGristImages(): Chainable<void>
    mockGristRecord(resourceId: string, element: object): Chainable<void>
    mockGristRecords(resourceId: string, elements?: object[]): Chainable<void>
    mockGristRecordsByIds(resourceId: string, elements: object[]): Chainable<void>
    mockMatomo(): Chainable<void>
    mockMetricsApi(datasetId: string): Chainable<void>
    mockResources(datasetId: string, data?: object[]): Chainable<void>
    mockResourceTypes(): Chainable<void>
    mockSpatialGranularities(): Chainable<void>
    mockSpatialLevels(): Chainable<void>
    mockSpatialZone(): Chainable<void>
    mockSpatialZonesSuggest(): Chainable<void>
    mockStaticDatagouv(): Chainable<void>
    mockTopicElements(resourceId: string, elements?: object[]): Chainable<void>
    mockUniverseOrganizations(): Chainable<void>
    selectFilterValue(selectLabel: string, optionLabel: string): Chainable<void>
    simulateConnectedUser(userData?: object): Chainable<void>
    simulateDisconnectedUser(): Chainable<void>
  }
}
