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
:deep(h2) {
  font-size: 2rem;
}
</style>
