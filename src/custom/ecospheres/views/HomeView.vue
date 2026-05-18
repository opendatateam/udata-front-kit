<script setup lang="ts">
import { useHead } from '@unhead/vue'

import config from '@/config'
import HomeAboutNews from '@/custom/ecospheres/components/home/HomeAboutNews.vue'
import HomeCollections from '@/custom/ecospheres/components/home/HomeCollections.vue'
import HomeContributors from '@/custom/ecospheres/components/home/HomeContributors.vue'
import HomeHero from '@/custom/ecospheres/components/home/HomeHero.vue'

useHead({
  meta: [
    { property: 'og:title', content: config.website.title },
    { name: 'description', content: config.website.homepage.meta_description },
    {
      property: 'og:description',
      content: config.website.homepage.meta_description
    }
  ],
  link: [{ rel: 'canonical', href: window.location.origin }]
})
</script>

<template>
  <div>
    <HomeHero />
    <HomeCollections />
    <HomeContributors />
    <HomeAboutNews />
  </div>
</template>

<style scoped>
:deep(h1) {
  /* fluid typography: 32px at ~375px viewport → 40px at ~992px viewport */
  font-size: clamp(2rem, 1.3vw + 1.7rem, 2.5rem);
}

:deep(h2) {
  /* fluid typography: 28px at ~375px viewport → 32px at ~992px viewport */
  font-size: clamp(1.75rem, 0.65vw + 1.6rem, 2rem);
}
</style>
