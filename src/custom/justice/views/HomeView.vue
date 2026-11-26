<script lang="ts" setup>
import config from '@/config'
import CivilActivity from '@/custom/justice/components/CivilActivity.vue'
import EducationalAssistance from '@/custom/justice/components/EducationalAssistance.vue'
import JusticeCustody from '@/custom/justice/components/JusticeCustody.vue'
import LocalJurisdictions from '@/custom/justice/components/LocalJurisdictions.vue'
import PenalIndicators from '@/custom/justice/components/PenalIndicators.vue'
import { useCanonicalUrl, useMeta } from '@/utils/seo'

useMeta({
  description: () => config.website.homepage.meta_description,
  canonicalUrl: useCanonicalUrl()
})
</script>

<template>
  <h1 class="fr-sr-only">{{ config.website.homepage.title }}</h1>
  <div class="bands">
    <div class="band fr-py-6w">
      <div class="fr-container">
        <CivilActivity />
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
