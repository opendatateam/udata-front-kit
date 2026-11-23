<script setup lang="ts">
import DesignExample from '@/components/design/DesignExample.vue'
import DesignSection from '@/components/design/DesignSection.vue'
import { illustration } from '@/views/design/cardExamples'
import CultureDatasetCard from '../CultureDatasetCard.vue'

const description =
  'Des données pour comprendre les **pratiques culturelles** et leur évolution sur le territoire.'
const link = '/_design/cards#culture-datasets'
</script>

<template>
  <DesignSection
    id="culture-datasets"
    title="Jeu de données culturel"
    component="CultureDatasetCard"
  >
    <DesignExample label="Avec image et libellé d'action" narrow>
      <CultureDatasetCard
        title="Pratiques culturelles des Français"
        :description="description"
        :img-src="illustration"
        alt-img=""
        :link="link"
        cta-label="Découvrir"
      />
    </DesignExample>
    <DesignExample label="Sans image, action par défaut" narrow>
      <CultureDatasetCard
        title="Fréquentation des musées"
        :description="description"
        :link="link"
      />
    </DesignExample>
  </DesignSection>
</template>
