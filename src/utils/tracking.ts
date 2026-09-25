import { getMatomo, trackEvent } from '@datagouv/components-next'

export const trackSearchValidated = (query: string, source: string) => {
  trackEvent('Moteur de recherche', 'Recherche validée', source)
  // results count isn't known at submit time (search executes after navigation);
  // Matomo's JS tracking client docs say to pass false for unknown, but the lib's type
  // declares it as a required number, hence the ts-expect-error
  // @ts-expect-error resultsCount is optional at runtime, unlike the lib's type
  getMatomo()?.trackSiteSearch(query, source, false)
}
