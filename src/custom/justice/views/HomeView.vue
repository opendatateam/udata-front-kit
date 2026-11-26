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
.band:nth-child(odd) {
  background: var(--background-default-grey);
}

.band:nth-child(even) {
  background: var(--background-alt-blue-france);
}
</style>
