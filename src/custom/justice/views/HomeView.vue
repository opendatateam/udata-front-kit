<script lang="ts" setup>
import config from '@/config'
import EducationalAssistance from '@/custom/justice/components/EducationalAssistance.vue'
import JusticeCustody from '@/custom/justice/components/JusticeCustody.vue'
import JusticeExplore from '@/custom/justice/components/JusticeExplore.vue'
import LocalJurisdictions from '@/custom/justice/components/LocalJurisdictions.vue'
import PenalIndicators from '@/custom/justice/components/PenalIndicators.vue'
import { useCanonicalUrl, useMeta } from '@/utils/seo'

useMeta({
  description: () => config.website.homepage.meta_description,
  canonicalUrl: useCanonicalUrl()
})
</script>

<template>
  <div class="bands">
    <div class="band fr-py-6w">
      <div class="fr-container">
        <JusticeExplore />
      </div>
    </div>
    <div class="band fr-py-6w">
      <div class="fr-container">
        <PenalIndicators />
      </div>
    </div>
    <div class="band fr-py-6w">
      <div class="fr-container">
        <EducationalAssistance />
      </div>
    </div>
    <div class="band fr-py-6w">
      <div class="fr-container">
        <LocalJurisdictions />
      </div>
    </div>
    <div class="band fr-py-6w">
      <div class="fr-container">
        <JusticeCustody />
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero {
  background: var(--background-contrast-blue-france, #e3e3fd);
}

.intro {
  max-inline-size: 62rem;
}

h1 {
  margin-bottom: 1rem;
  font-size: clamp(2.25rem, 1.2vw + 1.9rem, 3rem);
  line-height: 1.15;
  text-wrap: balance;
}

.band:nth-child(odd) {
  background: var(--background-default-grey, #fff);
}

.band:nth-child(even) {
  background: #f3f6fe;
}
</style>
