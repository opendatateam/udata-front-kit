<script setup lang="ts">
import { formatDate } from '@/utils'
import { useSpatialCoverage } from '@/utils/spatial'
import type { DatasetV2 } from '@datagouv/components'
import { toRef } from 'vue'
import { useTag } from '../../utils/indicator'
import InformationPanelItem from './informations/InformationPanelItem.vue'
import InformationPanelSection from './informations/InformationPanelSection.vue'

const props = defineProps({
  indicator: {
    type: Object as () => DatasetV2,
    required: true
  }
})

const indicator = toRef(props, 'indicator')
const spatialCoverage = useSpatialCoverage(indicator)
</script>

<template>
  <!-- Catégorisation -->
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
    <!-- <InformationPanelItem
      title="Chantier"
      :value="useTag(indicator, 'chantier').value?.value"
    /> -->
    <InformationPanelItem
      title="Secteur"
      :value="useTag(indicator, 'secteur').value?.value"
    />
  </InformationPanelSection>

  <!-- Métadonnées -->
  <InformationPanelSection title="Métadonnées">
    <template #description
      >Senectus et rutrum tempus enim. Laoreet blandit at lacus elementum
      gravida.</template
    >
    <InformationPanelItem
      title="Unité"
      :value="useTag(indicator, 'unite').value?.value"
    />
    <InformationPanelItem
      title="Mailles"
      :value="useTag(indicator, 'maille').value?.value"
    />
    <InformationPanelItem
      title="Axes"
      :value="useTag(indicator, 'axes').value?.value"
    />
    <InformationPanelItem title="Valeur des axes">
      <ul>
        <li>xxx</li>
        <li>xxx</li>
        <li>xxx</li>
        <li>xxx</li>
      </ul>
    </InformationPanelItem>
  </InformationPanelSection>

  <!-- Couverture -->
  <InformationPanelSection title="Couverture">
    <template #description
      >Senectus et rutrum tempus enim. Laoreet blandit at lacus elementum
      gravida.</template
    >
    <InformationPanelItem
      v-if="indicator.temporal_coverage"
      title="Couverture temporelle"
    >
      <!-- @vue-ignore FIXME: wrong type on upstream DatasetV2.temporal_coverage -->
      {{ formatDate(indicator.temporal_coverage.start, true) }}
      -
      <!-- @vue-ignore FIXME: wrong type on upstream DatasetV2.temporal_coverage -->
      {{ formatDate(indicator.temporal_coverage.end, true) }}
    </InformationPanelItem>
    <InformationPanelItem
      title="Couverture géographique"
      :value="spatialCoverage?.name"
    />
    <InformationPanelItem
      title="Date de mise à jour"
      :value="formatDate(indicator.last_update)"
    />
  </InformationPanelSection>

  <!-- Informations calcul -->
  <InformationPanelSection title="Informations calcul">
    <template #description
      >Senectus et rutrum tempus enim. Laoreet blandit at lacus elementum
      gravida.</template
    >
    <InformationPanelItem title="Responsable calcul" :is-row="true" />
    <InformationPanelItem title="Méthode calcul" :is-row="true" />
  </InformationPanelSection>
</template>

<style scoped>
:deep(.subtitle) {
  font-size: 1rem;
}
</style>
