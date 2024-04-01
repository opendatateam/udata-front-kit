<script setup lang="ts">
import type { PropType } from 'vue'

import BouquetDatasetList from '@/custom/ecospheres/components/BouquetDatasetList.vue'
import type { Bouquet } from '@/model'
import { getDatasetListTitle } from '@/utils/bouquet'
import { fromMarkdown } from '@/utils/index'
import { useSpatialCoverageFromField } from '@/utils/spatial'

const props = defineProps({
  bouquet: {
    type: Object as PropType<Bouquet>,
    default: () => ({})
  }
})

const emit = defineEmits(['updateStep'])

const spatialCoverage = useSpatialCoverageFromField(props.bouquet.spatial)

const goToStep = (step: number) => {
  emit('updateStep', step)
}
</script>

<template>
  <h4>
    Description du bouquet de données
    <DsfrButton
      :icon-only="true"
      size="sm"
      icon="ri-pencil-line"
      title="Editer Étape 1"
      :tertiary="true"
      :no-outline="true"
      @click.prevent="goToStep(1)"
    />
  </h4>

  <p class="fr-mb-0"><strong>Sujet du bouquet</strong></p>
  <p>{{ bouquet.name }}</p>
  <p class="fr-mb-0"><strong>Objectif du bouquet</strong></p>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <p v-html="bouquet.description ? fromMarkdown(bouquet.description) : ''" />
  <hr />

  <h4>
    Information du bouquet de données
    <DsfrButton
      :icon-only="true"
      size="sm"
      icon="ri-pencil-line"
      title="Editer Étape 2"
      :tertiary="true"
      :no-outline="true"
      @click.prevent="goToStep(2)"
    />
  </h4>
  <p class="fr-mb-0"><strong>Thématique</strong></p>
  <p>{{ bouquet.theme }}</p>
  <p class="fr-mb-0"><strong>Chantier</strong></p>
  <p>{{ bouquet.subtheme }}</p>
  <p class="fr-mb-0"><strong>Couverture territoriale</strong></p>
  <p>{{ spatialCoverage ? spatialCoverage.name : 'Pas de couverture' }}</p>
  <hr />

  <h4 v-if="bouquet.datasetsProperties">
    {{ getDatasetListTitle(bouquet.datasetsProperties) }}
    <DsfrButton
      :icon-only="true"
      size="sm"
      icon="ri-pencil-line"
      title="Editer Étape 3"
      :tertiary="true"
      :no-outline="true"
      @click.prevent="goToStep(3)"
    />
  </h4>
  <BouquetDatasetList :datasets="bouquet.datasetsProperties" />
</template>
