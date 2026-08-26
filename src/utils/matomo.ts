declare global {
  interface Window {
    _paq?: unknown[][]
  }
}

// Queues the event even if the Matomo tracker script hasn't loaded yet, it gets flushed once loaded.
// window._paq is only initialized when matomo.siteId is configured (see main.ts), hence the fallback.
export const trackEvent = (category: string, action: string, name: string) => {
  window._paq = window._paq ?? []
  window._paq.push(['trackEvent', category, action, name])
}
