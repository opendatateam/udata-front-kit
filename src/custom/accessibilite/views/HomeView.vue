<script lang="ts" setup>
import config from '@/config'
import { useMeta } from '@/utils/seo'

import HomeHero from '@/custom/accessibilite/components/home/HomeHero.vue'
import HomeThemes from '@/custom/accessibilite/components/home/HomeThemes.vue'
import HomeAbout from '../components/home/HomeAbout.vue'
import HomeLogos from '../components/home/HomeLogos.vue'

useMeta({
  description: () => config.website.homepage.meta_description,
  canonicalUrl: () => window.location.origin
})
</script>

<template>
  <HomeHero />

  <section class="fr-container fr-py-7w">
    <h2>Qu’est-ce que des données d’accessibilité ?</h2>
    <p class="fr-text--lead fr-mb-0 lead-text">
      Les données d’accessibilité sont des informations qui permettent de savoir
      si un lieu, un service, un trajet, un équipement sportif ou encore un site
      internet est accessible aux personnes en situation de handicap.
    </p>
  </section>

  <HomeThemes />
  <HomeLogos />
  <HomeAbout />
</template>

<style>
h1,
h2,
h3 {
  text-wrap: balance;
}

h2 {
  /* fluid typography: 28px at ~375px viewport → 32px at ~992px viewport */
  font-size: clamp(1.75rem, 0.65vw + 1.6rem, 2rem);
}

.lead-text {
  max-inline-size: 70ch;
}

#footer {
  margin-block-start: 0 !important;
}
</style>
