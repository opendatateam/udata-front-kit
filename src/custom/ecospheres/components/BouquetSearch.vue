<script setup lang="ts">
import { ref, computed, watch, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'

import { ConfigUtils } from '@/config'
import { NoOptionSelected } from '@/model'
import type { SelectOption, Theme } from '@/model'
import type { SpatialCoverage } from '@/model/spatial'
import { useUserStore } from '@/store/UserStore'

import SelectSpatialCoverage from './forms/SelectSpatialCoverage.vue'

const props = defineProps({
  themeName: {
    type: String,
    default: NoOptionSelected
  },
  subthemeName: {
    type: String,
    default: NoOptionSelected
  }
})

const emits = defineEmits(['update:showDrafts', 'update:geozone'])

const userStore = useUserStore()
const router = useRouter()

const showDrafts = ref(false)

const themeOptions = ConfigUtils.getThemeOptions()

const selectedTheme: ComputedRef<Theme | null> = computed(() => {
  return ConfigUtils.getThemeByName(props.themeName)
})

const subthemeOptions: ComputedRef<SelectOption[]> = computed(() => {
  return selectedTheme.value
    ? ConfigUtils.getSubthemeOptions(selectedTheme.value)
    : []
})

const switchTheme = (event: Event) => {
  router.push({
    path: '/bouquets',
    query: {
      theme: (event.target as HTMLInputElement)?.value,
      subtheme: NoOptionSelected
    }
  })
}

const switchSubtheme = (event: Event) => {
  router.push({
    path: '/bouquets',
    query: {
      theme: props.themeName,
      subtheme: (event.target as HTMLInputElement)?.value
    }
  })
}

const switchSpatialCoverage = (spatialCoverage: SpatialCoverage | null) => {
  emits('update:geozone', spatialCoverage != null ? spatialCoverage.id : null)
}

watch(showDrafts, (newVal) => {
  emits('update:showDrafts', newVal)
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
        @update:model-value="switchSpatialCoverage"
      />
    </div>
  </div>
</template>
