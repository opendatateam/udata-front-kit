<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components'
import { useTag } from '../../utils/indicator'
import InformationPanelItem from './informations/InformationPanelItem.vue'
import InformationPanelSection from './informations/InformationPanelSection.vue'

defineProps({
  indicator: {
    type: Object as () => DatasetV2,
    required: true
  }
})
</script>

<template>
  <InformationPanelSection title="Catégorisation">
    <template #description
      >Senectus et rutrum tempus enim. Laoreet blandit at lacus elementum
      gravida.</template
    >
    <InformationPanelItem
      title="Thématique"
      :value="useTag(indicator, 'theme').value?.value"
    />
    <InformationPanelItem
      title="Levier"
      :value="useTag(indicator, 'levier').value?.value"
    />
    <InformationPanelItem
      title="Enjeu"
      :value="useTag(indicator, 'enjeu').value?.value"
    />
    <InformationPanelItem
      title="Chantier"
      :value="useTag(indicator, 'chantier').value?.value"
    />
    <InformationPanelItem
      title="Secteur"
      :value="useTag(indicator, 'secteur').value?.value"
    />
  </InformationPanelSection>
</template>

<style scoped>
:deep(.subtitle) {
  font-size: 1rem;
}
</style>
