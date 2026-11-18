import type { Component } from 'vue'

// resolves to undefined on sites without a custom block
export const loadSiteCards = async (): Promise<Component | undefined> => {
  const siteCards = await import(
    `../../custom/${import.meta.env.VITE_SITE_ID}/components/design/DesignSiteCards.vue`
  ).catch(() => {
    console.info('No custom design cards for this site')
    return undefined
  })
  return siteCards?.default
}
