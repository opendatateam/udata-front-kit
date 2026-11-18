<script setup lang="ts">
import { provideDesignMenu } from '@/utils/design/designSections'
import { useCanonicalUrl, useMeta } from '@/utils/seo'

const route = useRoute()
const menuItems = provideDesignMenu()

const links = computed(() => [
  { to: '/', text: 'Accueil' },
  { to: '/_design', text: 'Système de design' },
  { text: route.meta.title ?? '' }
])

// the router ignores a click on the current hash, scroll back to the section anyway
const scrollToCurrentSection = (event: MouseEvent) => {
  const link = (event.target as Element).closest('a')
  if (link?.hash && link.hash === route.hash) {
    document.querySelector(link.hash)?.scrollIntoView()
  }
}

useMeta({
  description: () => undefined,
  canonicalUrl: useCanonicalUrl(),
  noIndex: () => true
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-3">
        <DsfrSideMenu
          class="fr-sidemenu--sticky-full-height"
          heading-title="Système de design"
          title-tag="p"
          button-label="Dans cette rubrique"
          @click="scrollToCurrentSection"
        >
          <DsfrSideMenuList id="design-menu-list" :menu-items="menuItems" />
          <ul class="fr-sidemenu__list">
            <DsfrSideMenuListItem>
              <a
                class="fr-sidemenu__link"
                href="https://demo.data.gouv.fr/design"
                target="_blank"
                rel="noopener"
                title="Système de design de data.gouv.fr - nouvelle fenêtre"
              >
                Système de design de data.gouv.fr
              </a>
            </DsfrSideMenuListItem>
          </ul>
        </DsfrSideMenu>
      </div>
      <div class="fr-col-12 fr-col-md-9">
        <RouterView />
      </div>
    </div>
  </div>
</template>
