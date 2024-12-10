<script setup lang="ts">
import { ref, watchEffect, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import SelectSpatialCoverage from '@/components/forms/SelectSpatialCoverage.vue'
import type { SpatialCoverage } from '@/model/spatial'
import SpatialAPI from '@/services/api/SpatialAPI'
import type { IndicatorFilters } from '../../model/indicator'
import { useFiltersConf } from '../../utils/config'
import SelectComponent from '../SelectComponent.vue'

const spatialAPI = new SpatialAPI()

type Props = IndicatorFilters & {
  geozone: string | null
}
const props = defineProps<Props>()

const router = useRouter()
const route = useRoute()

const selectedGeozone: Ref<string | null> = ref(null)
const selectedSpatialCoverage: Ref<SpatialCoverage | undefined> = ref(undefined)

const filtersConf = useFiltersConf()

const navigate = (data?: Record<string, string | null>) => {
  router.push({
    name: 'indicators',
    query: { ...route.query, ...data }
  })
}

const switchFilter = (filter: string, value: string | null) => {
  navigate({ [filter]: value })
}

const switchSpatialCoverage = (
  spatialCoverage: SpatialCoverage | null | undefined
) => {
  selectedGeozone.value = spatialCoverage != null ? spatialCoverage.id : null
  navigate({ geozone: selectedGeozone.value })
}

watchEffect(() => {
  if (props.geozone) {
    selectedGeozone.value = props.geozone
    spatialAPI
      .getZone(props.geozone)
      .then((zone) => (selectedSpatialCoverage.value = zone))
  } else {
    selectedSpatialCoverage.value = undefined
    selectedGeozone.value = null
  }
})
</script>

<template>
  <div className="filterForm">
    <div class="fr-select-group">
      <label class="fr-label" for="select-theme">{{
        filtersConf.theme.name
      }}</label>
      <SelectComponent
        id="select-theme"
        default-option="Toutes les thématiques"
        :options="filtersConf.theme.values"
        :model-value="props.theme"
        @update:model-value="(value) => switchFilter('theme', value)"
      />
    </div>
    <div class="fr-select-group">
      <label class="fr-label" for="select-theme">{{
        filtersConf.enjeu.name
      }}</label>
      <SelectComponent
        id="select-enjeu"
        default-option="Tous les enjeux"
        :options="filtersConf.enjeu.values"
        :model-value="props.enjeu"
        @update:model-value="(value) => switchFilter('enjeu', value)"
      />
    </div>
    <div class="fr-select-group">
      <label class="fr-label" for="select-spatial-coverage"
        >Couverture territoriale</label
      >
      <SelectSpatialCoverage
        v-model:spatial-coverage-model="selectedSpatialCoverage"
        :short="true"
        @update:spatial-coverage-model="switchSpatialCoverage"
      />
    </div>
  </div>
</template>
