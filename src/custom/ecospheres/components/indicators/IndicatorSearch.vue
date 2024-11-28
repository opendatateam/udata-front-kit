<script setup lang="ts">
import { ref, watchEffect, type PropType, type Ref } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'

import SelectSpatialCoverage from '@/components/forms/SelectSpatialCoverage.vue'
import type { SpatialCoverage } from '@/model/spatial'
import SpatialAPI from '@/services/api/SpatialAPI'
import { useFilterConf } from '../../utils/config'
import SelectComponent from '../SelectComponent.vue'

const spatialAPI = new SpatialAPI()

const props = defineProps({
  theme: {
    type: String as PropType<string | null>,
    default: null
  },
  geozone: {
    type: String as PropType<string | null>,
    default: null
  }
})

const router = useRouter()
const route = useRoute()

const selectedGeozone: Ref<string | undefined> = ref(undefined)
const selectedSpatialCoverage: Ref<SpatialCoverage | undefined> = ref(undefined)

const themeConf = useFilterConf('theme')

const computeQueryArgs = (
  data?: Record<string, string | null>
): LocationQueryRaw => {
  const query: LocationQueryRaw = {}
  if (props.theme) query.theme = props.theme
  if (selectedGeozone.value) query.geozone = selectedGeozone.value
  if (route.query.q) query.q = route.query.q
  return { ...query, ...data }
}

const navigate = (data?: Record<string, string | null>) => {
  router.push({
    name: 'indicators',
    query: computeQueryArgs(data)
  })
}

const switchTheme = (value: string | null) => {
  navigate({ theme: value })
}

const switchSpatialCoverage = (
  spatialCoverage: SpatialCoverage | null | undefined
) => {
  selectedGeozone.value =
    spatialCoverage != null ? spatialCoverage.id : undefined
  navigate()
}

watchEffect(() => {
  if (props.geozone) {
    selectedGeozone.value = props.geozone
    spatialAPI
      .getZone(props.geozone)
      .then((zone) => (selectedSpatialCoverage.value = zone))
  } else {
    selectedSpatialCoverage.value = undefined
    selectedGeozone.value = undefined
  }
})
</script>

<template>
  <div className="filterForm">
    <div class="fr-select-group">
      <label class="fr-label" for="select-theme">{{ themeConf.name }}</label>
      <SelectComponent
        id="select-theme"
        default-option="Toutes les thématiques"
        :options="themeConf.values"
        @update:model-value="switchTheme"
      />
    </div>
    <div class="fr-select-group">
      <label class="fr-label" for="select-spatial-coverage"
        >Couverture territoriale</label
      >
      <SelectSpatialCoverage
        v-model="selectedSpatialCoverage"
        :short="true"
        @update:spatial-coverage-model="switchSpatialCoverage"
      />
    </div>
  </div>
</template>
