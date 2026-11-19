<script setup lang="ts">
import { provideDesignMenu } from '@/components/design/designSections'
import { useCanonicalUrl, useMeta } from '@/utils/seo'

const menuItems = provideDesignMenu()

useMeta({
  description: () => undefined,
  canonicalUrl: useCanonicalUrl(),
  noIndex: () => true
})
</script>

<template>
  <div class="fr-container fr-mt-4w">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-3">
        <DsfrSideMenu
          class="fr-sidemenu--sticky-full-height"
          heading-title="Système de design"
          title-tag="p"
          button-label="Dans cette rubrique"
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
