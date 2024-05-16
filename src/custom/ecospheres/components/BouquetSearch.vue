<script setup lang="ts">
import { ref, watch, watchEffect, toRef, type Ref, type PropType } from 'vue'
import { useRouter, type LocationQueryRaw } from 'vue-router'

import type { SpatialCoverage } from '@/model/spatial'
import { NoOptionSelected } from '@/model/theme'
import SpatialAPI from '@/services/api/SpatialAPI'
import { useUserStore } from '@/store/UserStore'
import { useThemeOptions } from '@/utils/theme'

import SelectSpatialCoverage from './forms/SelectSpatialCoverage.vue'

const spatialAPI = new SpatialAPI()

const props = defineProps({
  themeName: {
    type: String,
    default: NoOptionSelected
  },
  subthemeName: {
    type: String,
    default: NoOptionSelected
  },
  geozone: {
    type: String as PropType<string | null>,
    default: null
  }
})

const emits = defineEmits(['update:showDrafts', 'update:geozone'])

const userStore = useUserStore()
const router = useRouter()

const showDrafts = ref(false)
const selectedGeozone: Ref<string | null> = ref(null)
const selectedSpatialCoverage: Ref<SpatialCoverage | null> = ref(null)

const themeNameRef = toRef(props, 'themeName')
const { themeOptions, subthemeOptions } = useThemeOptions(themeNameRef)

const computeQueryArgs = (
  data: Record<string, string | null>
): LocationQueryRaw => {
  const query: LocationQueryRaw = {}
  if (props.themeName) query.theme = props.themeName
  if (props.subthemeName) query.subtheme = props.subthemeName
  if (selectedGeozone.value) query.geozone = selectedGeozone.value
  return { ...query, ...data }
}

const switchTheme = (event: Event) => {
  router.push({
    path: '/bouquets',
    query: computeQueryArgs({
      theme: (event.target as HTMLInputElement)?.value,
      subtheme: NoOptionSelected
    })
  })
}

const switchSubtheme = (event: Event) => {
  router.push({
    path: '/bouquets',
    query: computeQueryArgs({
      subtheme: (event.target as HTMLInputElement)?.value
    })
  })
}

const switchSpatialCoverage = (spatialCoverage: SpatialCoverage | null) => {
  selectedGeozone.value = spatialCoverage != null ? spatialCoverage.id : null
  router.push({
    path: '/bouquets',
    query: computeQueryArgs({})
  })
}

watch(showDrafts, (newVal) => {
  emits('update:showDrafts', newVal)
})

watchEffect(() => {
  if (props.geozone) {
    spatialAPI
      .getZone(props.geozone)
      .then((zone) => (selectedSpatialCoverage.value = zone))
  }
})
</script>

<template>
  <div className="filterForm">
    <DsfrCheckbox
      v-if="userStore.isLoggedIn"
      v-model="showDrafts"
      label="Afficher les brouillons"
      name="show_drafts"
    />

    <div class="fr-select-group">
      <label class="fr-label" for="select_theme"> Thématiques </label>
      <select id="select_theme" class="fr-select" @change="switchTheme($event)">
        <option
          :value="NoOptionSelected"
          :selected="themeName == NoOptionSelected"
        >
          Choisir une thématique
        </option>
        <option
          v-for="option in themeOptions"
          :key="option.value"
          :value="option.value"
          :selected="option.value === themeName"
        >
          {{ option.text }}
        </option>
      </select>
    </div>

    <div class="fr-select-group">
      <label class="fr-label" for="select_subtheme"> Chantiers </label>
      <select
        id="select_subtheme"
        class="fr-select"
        @change="switchSubtheme($event)"
      >
        <option
          :value="NoOptionSelected"
          :selected="subthemeName == NoOptionSelected"
        >
          Choisir un chantier
        </option>
        <option
          v-for="option in subthemeOptions"
          :key="option.value"
          :value="option.value"
          :selected="option.value === subthemeName"
        >
          {{ option.text }}
        </option>
      </select>
    </div>
    <div class="fr-select-group">
      <label class="fr-label" for="select_subtheme"
        >Couverture territoriale</label
      >
      <SelectSpatialCoverage
        placeholder="Rechercher"
        :short="true"
        :value="selectedSpatialCoverage"
        @update:model-value="switchSpatialCoverage"
      />
    </div>
  </div>
</template>
