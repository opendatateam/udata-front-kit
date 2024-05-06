<script setup lang="ts">
import { computed } from 'vue'

import { ConfigUtils } from '@/config'
import { NoOptionSelected, type SelectOption, type Theme } from '@/model'
import type { SpatialCoverage, SpatialField } from '@/model/spatial'
import { useSpatialCoverageFromField } from '@/utils/spatial'

import SelectSpatialCoverage from '../SelectSpatialCoverage.vue'

const props = defineProps({
  theme: {
    type: String,
    default: NoOptionSelected
  },
  subtheme: {
    type: String,
    default: NoOptionSelected
  },
  spatialField: {
    type: Object as () => SpatialField,
    default: () => ({})
  }
})

const emit = defineEmits([
  'update:theme',
  'update:subtheme',
  'update:spatialField'
])

const spatialCoverage = useSpatialCoverageFromField(props.spatialField)

const selectedTheme = computed((): Theme | null => {
  return ConfigUtils.getThemeByName(props.theme)
})

const themeOptions = computed((): SelectOption[] => {
  return ConfigUtils.getThemeOptions()
})

const subthemeOptions = computed((): SelectOption[] => {
  return selectedTheme.value
    ? ConfigUtils.getSubthemeOptions(selectedTheme.value)
    : []
})

const switchTheme = (event: Event) => {
  emit('update:theme', (event.target as HTMLSelectElement).value)
  emit('update:subtheme', NoOptionSelected)
}

const switchSubtheme = (event: Event) => {
  emit('update:subtheme', (event.target as HTMLSelectElement).value)
}

const onUpdateSpatialCoverage = (value: SpatialCoverage | null) => {
  const zones = value === null ? null : [value.id]
  emit('update:spatialField', { ...props.spatialField, zones } as SpatialField)
}
</script>

<template>
  <div class="fr-select-group fr-mt-1w">
    <label class="fr-label" for="select_theme">Thématique</label>
    <select id="select_theme" class="fr-select" @change="switchTheme($event)">
      <option :value="NoOptionSelected" :selected="theme == NoOptionSelected">
        Choisir une thématique
      </option>
      <option
        v-for="option in themeOptions"
        :key="option.value"
        :value="option.value"
        :selected="option.value === theme"
      >
        {{ option.text }}
      </option>
    </select>
  </div>

  <div class="fr-select-group fr-mt-1w">
    <label class="fr-label" for="select_subtheme">Chantier</label>
    <select
      id="select_subtheme"
      class="fr-select"
      :disabled="theme === NoOptionSelected"
      @change="switchSubtheme($event)"
    >
      <option
        :value="NoOptionSelected"
        :selected="subtheme == NoOptionSelected"
      >
        Choisir un chantier
      </option>
      <option
        v-for="option in subthemeOptions"
        :key="option.value"
        :value="option.value"
        :selected="option.value === subtheme"
      >
        {{ option.text }}
      </option>
    </select>
  </div>

  <div class="fr-select-group fr-mt-1w">
    <label class="fr-label" for="select-spatial-coverage"
      >Couverture territoriale</label
    >
    <SelectSpatialCoverage
      :value="spatialCoverage"
      @update:model-value="onUpdateSpatialCoverage"
    />
  </div>
</template>

<style lang="scss">
// /!\ style won't apply to .multiselect-option if style=scoped
// so we're scoping manually with a parent class
.multiselect-spatial-coverage {
  .multiselect-options {
    .multiselect-option {
      flex-direction: column;
      align-items: flex-start;
      .code,
      .level {
        font-size: 0.8rem;
      }
      .level {
        display: block;
      }
    }
  }
}
</style>
