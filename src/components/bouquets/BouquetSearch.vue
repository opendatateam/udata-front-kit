<script setup lang="ts">
import {
  capitalize,
  ref,
  toRef,
  watchEffect,
  type PropType,
  type Ref
} from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'

import SelectSpatialCoverage from '@/components/forms/SelectSpatialCoverage.vue'
import type { SpatialCoverage } from '@/model/spatial'
import { NoOptionSelected } from '@/model/theme'
import SpatialAPI from '@/services/api/SpatialAPI'
import { useUserStore } from '@/store/UserStore'
import { useTopicsConf } from '@/utils/config'
import { useThemeOptions } from '@/utils/theme'

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
  },
  showDrafts: {
    type: Boolean,
    default: false
  }
})

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const selectedGeozone: Ref<string | undefined> = ref(undefined)
const selectedSpatialCoverage: Ref<SpatialCoverage | undefined> = ref(undefined)

const themeNameRef = toRef(props, 'themeName')
const { themeOptions, subthemeOptions } = useThemeOptions(themeNameRef)

const { topicsSlug, topicsUseThemes, topicsMainTheme, topicsSecondaryTheme } =
  useTopicsConf()
const localShowDrafts = ref(false)

const computeQueryArgs = (
  data?: Record<string, string | null>
): LocationQueryRaw => {
  const query: LocationQueryRaw = {}
  if (props.themeName) query.theme = props.themeName
  if (props.subthemeName) query.subtheme = props.subthemeName
  if (selectedGeozone.value) query.geozone = selectedGeozone.value
  query.drafts = localShowDrafts.value ? '1' : '0'
  if (route.query.q) {
    query.q = route.query.q
  }
  return { ...query, ...data }
}

const navigate = (data?: Record<string, string | null>) => {
  router.push({
    path: `/${topicsSlug}`,
    query: computeQueryArgs(data)
  })
}

const switchTheme = (event: Event) => {
  navigate({
    theme: (event.target as HTMLInputElement)?.value,
    subtheme: NoOptionSelected
  })
}

const switchSubtheme = (event: Event) => {
  navigate({
    subtheme: (event.target as HTMLInputElement)?.value
  })
}

const switchSpatialCoverage = (
  spatialCoverage: SpatialCoverage | null | undefined
) => {
  selectedGeozone.value =
    spatialCoverage != null ? spatialCoverage.id : undefined
  navigate()
}

const switchLocalShowDrafts = () => {
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
  localShowDrafts.value = props.showDrafts
})
</script>

<template>
  <div className="filterForm">
    <DsfrCheckbox
      v-if="userStore.isLoggedIn"
      v-model="localShowDrafts"
      label="Afficher les brouillons"
      name="show_drafts"
      @update:model-value="switchLocalShowDrafts"
    />
    <template v-if="topicsUseThemes">
      <div class="fr-select-group">
        <label class="fr-label" for="select_theme">
          {{ capitalize(topicsMainTheme) }}s
        </label>
        <select
          id="select_theme"
          class="fr-select"
          @change="switchTheme($event)"
        >
          <option
            :value="NoOptionSelected"
            :selected="themeName == NoOptionSelected"
          >
            Toutes les {{ topicsMainTheme }}s
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
        <label class="fr-label" for="select_subtheme">
          {{ capitalize(topicsSecondaryTheme) }}s
        </label>
        <select
          id="select_subtheme"
          class="fr-select"
          @change="switchSubtheme($event)"
        >
          <option
            :value="NoOptionSelected"
            :selected="subthemeName == NoOptionSelected"
          >
            Tous les {{ topicsSecondaryTheme }}s
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
    </template>
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
