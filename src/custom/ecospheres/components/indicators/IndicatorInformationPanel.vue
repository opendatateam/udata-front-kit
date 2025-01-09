<script setup lang="ts">
import { formatDate } from '@/utils'
import { useSpatialCoverage } from '@/utils/spatial'
import { toRef } from 'vue'
import type { Indicator } from '../../model/indicator'
import { useIndicatorExtras } from '../../utils/indicator'
import IndicatorTags from './IndicatorTags.vue'
import InformationPanelItem from './informations/InformationPanelItem.vue'
import InformationPanelSection from './informations/InformationPanelSection.vue'

const props = defineProps({
  indicator: {
    type: Object as () => Indicator,
    required: true
  }
})

const indicator = toRef(props, 'indicator')
const spatialCoverage = useSpatialCoverage(indicator)
const { unite, mailles, axes, calcul } = useIndicatorExtras(indicator)
</script>

<template>
  <!-- Catégorisation -->
  <InformationPanelSection title="Catégorisation">
    <template #description
      >Senectus et rutrum tempus enim. Laoreet blandit at lacus elementum
      gravida.</template
    >
    <InformationPanelItem title="Thématique">
      <IndicatorTags :indicator="indicator" type="theme" />
    </InformationPanelItem>
    <InformationPanelItem title="Enjeux">
      <IndicatorTags :indicator="indicator" type="enjeu" />
    </InformationPanelItem>
    <InformationPanelItem title="Secteur">
      <IndicatorTags :indicator="indicator" type="secteur" />
    </InformationPanelItem>
    <InformationPanelItem title="Levier">
      <IndicatorTags :indicator="indicator" type="levier" />
    </InformationPanelItem>
  </InformationPanelSection>

  <!-- Métadonnées -->
  <InformationPanelSection title="Métadonnées">
    <template #description
      >Senectus et rutrum tempus enim. Laoreet blandit at lacus elementum
      gravida.</template
    >
    <InformationPanelItem title="Unité" :value="unite" />
    <InformationPanelItem title="Mailles" :value="mailles.join(', ')" />

    <template v-for="(values, axis, index) in axes" :key="axis">
      <InformationPanelItem :title="`Axe n°${index + 1} - ${axis}`">
        <ul>
          <li v-for="value in values" :key="value">{{ value }}</li>
        </ul>
      </InformationPanelItem>
    </template>
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
    <InformationPanelItem
      title="Responsable calcul"
      :is-row="true"
      :value="calcul?.responsable"
    />
    <InformationPanelItem
      title="Méthode calcul"
      :is-row="true"
      :value="calcul?.methode"
      :is-markdown="true"
    />
  </InformationPanelSection>
</template>

<style scoped>
:deep(.subtitle) {
  font-size: 1rem;
}
</style>
