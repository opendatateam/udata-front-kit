<script setup lang="ts">
import { formatDate } from '@/utils'
import { useSpatialCoverage } from '@/utils/spatial'
import { DateRangeDetails } from '@datagouv/components-next'
import { toRef } from 'vue'
import type { Indicator } from '../../model/indicator'
import { UNFILLED_LABEL, useIndicatorExtras } from '../../utils/indicator'
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
const { unite, mailles, axes } = useIndicatorExtras(indicator)
</script>

<template>
  <!-- Catégorisation -->
  <InformationPanelSection title="Catégorisation">
    <template #description
      >Les informations ci-dessous permettent de mieux qualifier les politiques
      publiques de transition écologique que l'indicateur cherche à suivre. Les
      catégories proposées sont celle de la planification écologique France
      Nation Verte.</template
    >
    <InformationPanelItem title="Enjeux">
      <IndicatorTags :indicator="indicator" type="enjeu" />
    </InformationPanelItem>
    <InformationPanelItem title="Thématique">
      <IndicatorTags :indicator="indicator" type="theme" />
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
    <InformationPanelItem title="Unité" :value="unite" />
    <InformationPanelItem
      title="Mailles"
      :value="mailles.length ? mailles.join(', ') : UNFILLED_LABEL"
    />

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
    <InformationPanelItem
      v-if="indicator.temporal_coverage"
      title="Couverture temporelle"
    >
      <DateRangeDetails :range="indicator.temporal_coverage" />
    </InformationPanelItem>
    <InformationPanelItem
      title="Date de mise à jour"
      :value="formatDate(indicator.last_update)"
    />
    <InformationPanelItem
      title="Couverture géographique"
      :value="spatialCoverage?.name"
    />
  </InformationPanelSection>
</template>
